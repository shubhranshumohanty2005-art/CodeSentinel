"""
Bug Triage Assistant service.

Analyzes GitHub issues and suggests:
- Labels
- Severity (P0–P3)
- Likely owner (based on git blame / commit history)
- Duplicate detection (keyword/TF-IDF similarity)
"""
import re
import uuid
import logging
from collections import Counter
from apps.ai.ai_client import generate_json
from apps.ai.prompts.templates import bug_triage_prompt
from apps.github_integration import github_client as gh
from apps.core import firestore_client as db

logger = logging.getLogger(__name__)


def _extract_file_paths(issue_body):
    """Extract file paths and stack traces from issue body."""
    patterns = [
        r'(?:File\s+["\']?)([a-zA-Z0-9_/\\.-]+\.\w+)',
        r'(?:at\s+)([a-zA-Z0-9_/\\.-]+\.\w+)',
        r'(?:in\s+)([a-zA-Z0-9_/\\.-]+\.\w+)',
    ]
    files = set()
    for pattern in patterns:
        files.update(re.findall(pattern, issue_body or ''))
    return list(files)


def _find_file_authors(token, owner, repo, file_paths):
    """Find recent commit authors for the mentioned files."""
    authors = Counter()
    for path in file_paths[:5]:  # Limit to 5 files
        try:
            commits = gh.list_commits(token, owner, repo, path=path, per_page=10)
            for commit in commits:
                author = commit.get('author', {})
                if author and author.get('login'):
                    authors[author['login']] += 1
        except Exception as e:
            logger.warning(f"Failed to get commits for {path}: {e}")

    return dict(authors.most_common(5))


def _simple_duplicate_check(issue_title, existing_issues):
    """
    Simple keyword-based duplicate check using TF-IDF-like similarity.

    NOTE: For production, this should use embedding-based semantic search
    (e.g., sentence-transformers or OpenAI embeddings) for better accuracy.
    """
    if not existing_issues:
        return []

    # Tokenize the title
    title_words = set(re.findall(r'\w+', issue_title.lower()))
    title_words -= {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or'}

    duplicates = []
    for issue in existing_issues:
        other_title = issue.get('title', '')
        other_words = set(re.findall(r'\w+', other_title.lower()))
        other_words -= {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or'}

        if not title_words or not other_words:
            continue

        # Jaccard similarity
        intersection = title_words & other_words
        union = title_words | other_words
        similarity = len(intersection) / len(union) if union else 0

        if similarity > 0.4:
            duplicates.append({
                'number': issue.get('number'),
                'title': other_title,
                'similarity': round(similarity, 2),
            })

    return sorted(duplicates, key=lambda x: x['similarity'], reverse=True)[:3]


def analyze_issue(token, owner, repo, issue_number, repo_id, job_id=None):
    """
    Analyze a GitHub issue end-to-end.

    1. Fetch the issue from GitHub
    2. Extract file paths from the issue body
    3. Find likely owners from git commit history
    4. Check for duplicate issues
    5. Call AI for triage suggestions
    6. Save results to Firestore
    """
    if job_id:
        db.update_job_status(repo_id, job_id, 'fetching_diff', 10, 'Fetching issue details...')

    # Fetch the issue
    issue = gh.get_issue(token, owner, repo, issue_number)
    issue_title = issue.get('title', '')
    issue_body = issue.get('body', '')

    if job_id:
        db.update_job_status(repo_id, job_id, 'fetching_diff', 30, 'Analyzing file references...')

    # Extract file paths and find authors
    file_paths = _extract_file_paths(issue_body)
    file_authors = _find_file_authors(token, owner, repo, file_paths) if file_paths else {}

    if job_id:
        db.update_job_status(repo_id, job_id, 'fetching_diff', 40, 'Checking for duplicates...')

    # Check for duplicates
    existing_issues = gh.list_issues(token, owner, repo, state='open')
    # Remove the current issue from the list
    existing_issues = [i for i in existing_issues if i.get('number') != issue_number]
    potential_duplicates = _simple_duplicate_check(issue_title, existing_issues)

    existing_issues_text = '\n'.join([
        f"- #{i.get('number')}: {i.get('title', '')}"
        for i in existing_issues[:20]
    ])

    file_authors_text = '\n'.join([
        f"- {author}: {count} recent commits on relevant files"
        for author, count in file_authors.items()
    ])

    if job_id:
        db.update_job_status(repo_id, job_id, 'calling_ai', 60, 'AI analyzing issue...')

    # Call AI for triage
    system, user_prompt = bug_triage_prompt(
        issue_title, issue_body, existing_issues_text, file_authors_text
    )
    result = generate_json(user_prompt, system=system)
    triage_data = result['data']

    if job_id:
        db.update_job_status(repo_id, job_id, 'saving', 90, 'Saving triage results...')

    # Build the report
    report = {
        'labels': triage_data.get('labels', []),
        'severity': triage_data.get('severity', 'P2'),
        'likelyOwner': triage_data.get('likely_owner', ''),
        'duplicateOf': triage_data.get('duplicate_of'),
        'reasoning': triage_data.get('reasoning', ''),
        'potentialDuplicates': potential_duplicates,
        'fileAuthors': file_authors,
        'aiProvider': result['provider'],
        'issueTitle': issue_title,
        'issueUrl': issue.get('html_url', ''),
    }

    db.save_triage(repo_id, issue_number, report)

    if job_id:
        db.update_job_status(repo_id, job_id, 'done', 100, 'Triage complete!')
        db.clear_job_status(repo_id, job_id)

    return report


def apply_labels_to_github(token, owner, repo, issue_number, labels):
    """Apply the suggested labels to the GitHub issue."""
    try:
        gh.add_issue_labels(token, owner, repo, issue_number, labels)
        return True
    except Exception as e:
        logger.error(f"Failed to apply labels: {e}")
        raise
