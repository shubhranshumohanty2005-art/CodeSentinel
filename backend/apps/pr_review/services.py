"""
PR Review service — fetches diff, analyzes with AI, saves report.
"""
import logging
import uuid
from apps.ai.ai_client import generate_json
from apps.ai.skills.github_diff_summarizer import summarize_diff
from apps.ai.prompts.templates import pr_review_prompt
from apps.github_integration import github_client as gh
from apps.core import firestore_client as db

logger = logging.getLogger(__name__)

# Max diff size per chunk (chars) to stay within token limits
MAX_CHUNK_SIZE = 12000


def _parse_diff_by_file(diff_text):
    """Split a unified diff into per-file chunks."""
    files = []
    current_file = None
    current_lines = []

    for line in diff_text.split('\n'):
        if line.startswith('diff --git'):
            if current_file:
                files.append((current_file, '\n'.join(current_lines)))
            # Extract file path from diff header
            parts = line.split(' b/')
            current_file = parts[-1] if len(parts) > 1 else 'unknown'
            current_lines = [line]
        else:
            current_lines.append(line)

    if current_file:
        files.append((current_file, '\n'.join(current_lines)))

    return files


def _chunk_diff(file_path, diff_content):
    """Split a large diff into chunks that fit within token limits."""
    if len(diff_content) <= MAX_CHUNK_SIZE:
        return [(file_path, diff_content)]

    chunks = []
    lines = diff_content.split('\n')
    current_chunk = []
    current_size = 0

    for line in lines:
        if current_size + len(line) > MAX_CHUNK_SIZE and current_chunk:
            chunks.append((file_path, '\n'.join(current_chunk)))
            current_chunk = []
            current_size = 0
        current_chunk.append(line)
        current_size += len(line)

    if current_chunk:
        chunks.append((file_path, '\n'.join(current_chunk)))

    return chunks


def analyze_pr(token, owner, repo, pr_number, repo_id, job_id=None):
    """
    Analyze a pull request end-to-end.

    1. Fetches the PR diff from GitHub
    2. Chunks it per file
    3. Sends each chunk to AI for analysis
    4. Aggregates results
    5. Saves to Firestore
    6. Updates job status in RTDB

    Returns the full review report.
    """
    if job_id:
        db.update_job_status(repo_id, job_id, 'fetching_diff', 10, 'Fetching PR diff from GitHub...')

    # Fetch diff
    try:
        diff_text = gh.get_pr_diff(token, owner, repo, pr_number)
    except Exception as e:
        logger.error(f"Failed to fetch PR diff: {e}")
        if job_id:
            db.update_job_status(repo_id, job_id, 'error', 0, f'Failed to fetch diff: {e}')
        raise

    # Also get a summary using the reusable skill
    pr_info = gh.get_pull_request(token, owner, repo, pr_number)
    context = f"PR #{pr_number}: {pr_info.get('title', '')}"

    if job_id:
        db.update_job_status(repo_id, job_id, 'calling_ai', 30, 'Analyzing diff with AI...')

    # Get high-level summary via the reusable skill
    try:
        summary_result = summarize_diff(diff_text[:MAX_CHUNK_SIZE], context=context)
        diff_summary = summary_result['data']
    except Exception as e:
        logger.warning(f"Diff summarizer skill failed: {e}")
        diff_summary = {'summary': 'Summary unavailable', 'risk_level': 'medium'}

    # Parse diff by file and analyze each chunk
    file_diffs = _parse_diff_by_file(diff_text)
    all_comments = []
    total_chunks = sum(len(_chunk_diff(fp, dc)) for fp, dc in file_diffs)
    processed = 0

    for file_path, file_diff in file_diffs:
        chunks = _chunk_diff(file_path, file_diff)
        for chunk_path, chunk_content in chunks:
            try:
                system, user_prompt = pr_review_prompt(chunk_path, chunk_content)
                result = generate_json(user_prompt, system=system)
                data = result['data']

                if 'comments' in data:
                    for comment in data['comments']:
                        comment['provider'] = result['provider']
                    all_comments.extend(data['comments'])

            except Exception as e:
                logger.warning(f"Failed to analyze chunk {chunk_path}: {e}")
                all_comments.append({
                    'file': chunk_path,
                    'line': 0,
                    'severity': 'info',
                    'comment': f'Analysis failed for this file: {e}',
                })

            processed += 1
            if job_id:
                percent = 30 + int((processed / max(total_chunks, 1)) * 50)
                db.update_job_status(repo_id, job_id, 'calling_ai', percent,
                                     f'Analyzed {processed}/{total_chunks} chunks...')

    # Calculate overall risk score
    severity_weights = {'critical': 25, 'warning': 10, 'info': 2}
    risk_score = min(100, sum(
        severity_weights.get(c.get('severity', 'info'), 2)
        for c in all_comments
    ))

    if job_id:
        db.update_job_status(repo_id, job_id, 'saving', 90, 'Saving review report...')

    # Build the report
    report = {
        'summary': diff_summary.get('summary', 'Review complete'),
        'riskScore': risk_score,
        'comments': all_comments,
        'filesAnalyzed': len(file_diffs),
        'diffSummary': diff_summary,
        'aiProvider': all_comments[0].get('provider', 'unknown') if all_comments else 'none',
        'prTitle': pr_info.get('title', ''),
        'prUrl': pr_info.get('html_url', ''),
    }

    # Save to Firestore
    db.save_pr_review(repo_id, pr_number, report)

    if job_id:
        db.update_job_status(repo_id, job_id, 'done', 100, 'Review complete!')
        db.clear_job_status(repo_id, job_id)

    return report


def post_review_to_github(token, owner, repo, pr_number, report):
    """Post the review comments back to GitHub."""
    body = f"## 🛡️ CodeSentinel Review\n\n"
    body += f"**Risk Score:** {report['riskScore']}/100\n\n"
    body += f"**Summary:** {report['summary']}\n\n"
    body += f"### Issues Found: {len(report['comments'])}\n\n"

    for comment in report['comments']:
        icon = {'critical': '🔴', 'warning': '🟡', 'info': '🔵'}.get(comment.get('severity', 'info'), '⚪')
        body += f"- {icon} **{comment.get('file', 'unknown')}** (line {comment.get('line', '?')}): {comment.get('comment', '')}\n"

    try:
        gh.post_pr_review(token, owner, repo, pr_number, body, event="COMMENT")
        return True
    except Exception as e:
        logger.error(f"Failed to post review to GitHub: {e}")
        raise
