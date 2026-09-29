"""
Docs & Changelog Generator service.

Modes:
- "readme": Generates/updates a README by reading the repo file tree and key source files
- "changelog": Generates a changelog entry from commits between two refs
"""
import uuid
import logging
from apps.ai.ai_client import generate
from apps.ai.prompts.templates import docs_readme_prompt, docs_changelog_prompt
from apps.github_integration import github_client as gh
from apps.core import firestore_client as db

logger = logging.getLogger(__name__)

# Limits for readme generation
MAX_FILES_TO_READ = 10
MAX_FILE_SIZE = 5000  # chars


def _build_file_tree_string(tree_data):
    """Build a readable file tree string from GitHub API tree response."""
    tree = tree_data.get('tree', [])
    lines = []
    for item in tree[:100]:  # Limit to 100 entries
        indent = '  ' * item['path'].count('/')
        name = item['path'].split('/')[-1]
        if item['type'] == 'tree':
            lines.append(f"{indent}📁 {name}/")
        else:
            lines.append(f"{indent}📄 {name}")
    return '\n'.join(lines)


def _get_key_files_content(token, owner, repo, tree_data):
    """Read the content of key files for README generation."""
    # Priority files to read
    priority_files = [
        'README.md', 'package.json', 'requirements.txt', 'setup.py',
        'Cargo.toml', 'go.mod', 'pom.xml', 'Makefile', 'Dockerfile',
        'docker-compose.yml', '.env.example',
    ]

    tree = tree_data.get('tree', [])
    key_files = []

    # First, get priority files
    for pf in priority_files:
        for item in tree:
            if item['path'].lower() == pf.lower() and item['type'] == 'blob':
                key_files.append(item['path'])
                break

    # Then add source files (entry points, main files)
    source_patterns = ['main.', 'index.', 'app.', 'server.', 'src/main.', 'src/index.', 'src/app.']
    for item in tree:
        if item['type'] == 'blob' and any(item['path'].lower().startswith(p) or
                                            item['path'].lower().endswith(p.split('.')[0] + item['path'].split('.')[-1])
                                            for p in source_patterns):
            if item['path'] not in key_files:
                key_files.append(item['path'])

    # Read the content of each key file
    contents = []
    for path in key_files[:MAX_FILES_TO_READ]:
        try:
            file_data = gh.get_file_content(token, owner, repo, path)
            content = file_data.get('decoded_content', '')[:MAX_FILE_SIZE]
            contents.append(f"### {path}\n```\n{content}\n```\n")
        except Exception as e:
            logger.warning(f"Failed to read {path}: {e}")

    return '\n'.join(contents)


def generate_readme(token, owner, repo, repo_id, job_id=None):
    """Generate a README.md for a repository."""
    if job_id:
        db.update_job_status(repo_id, job_id, 'fetching_diff', 10, 'Reading repository structure...')

    # Get repo tree
    try:
        tree_data = gh.get_repo_tree(token, owner, repo)
        file_tree = _build_file_tree_string(tree_data)
    except Exception as e:
        logger.error(f"Failed to get repo tree: {e}")
        file_tree = "(File tree unavailable)"

    if job_id:
        db.update_job_status(repo_id, job_id, 'fetching_diff', 30, 'Reading key files...')

    # Read key files
    try:
        key_content = _get_key_files_content(token, owner, repo, tree_data if 'tree_data' in dir() else {'tree': []})
    except Exception:
        key_content = "(Key files unavailable)"

    if job_id:
        db.update_job_status(repo_id, job_id, 'calling_ai', 50, 'Generating README with AI...')

    # Generate with AI
    repo_name = f"{owner}/{repo}"
    system, user_prompt = docs_readme_prompt(repo_name, file_tree, key_content)
    result = generate(user_prompt, system=system)

    doc_id = f"readme_{uuid.uuid4().hex[:8]}"
    doc_data = {
        'mode': 'readme',
        'content': result['content'],
        'aiProvider': result['provider'],
    }

    if job_id:
        db.update_job_status(repo_id, job_id, 'saving', 90, 'Saving generated docs...')

    db.save_docs(repo_id, doc_id, doc_data)

    if job_id:
        db.update_job_status(repo_id, job_id, 'done', 100, 'README generated!')
        db.clear_job_status(repo_id, job_id)

    return {**doc_data, 'id': doc_id}


def generate_changelog(token, owner, repo, base_ref, head_ref, repo_id, job_id=None):
    """Generate a changelog entry from commits between two refs."""
    if job_id:
        db.update_job_status(repo_id, job_id, 'fetching_diff', 10, 'Fetching commits...')

    # Get commits between refs
    try:
        compare_data = gh.get_commits_between(token, owner, repo, base_ref, head_ref)
        commits = compare_data.get('commits', [])
        commit_text = '\n'.join([
            f"- {c['commit']['message'].split(chr(10))[0]} ({c['sha'][:7]}) by {c['commit']['author']['name']}"
            for c in commits
        ])
    except Exception as e:
        logger.error(f"Failed to fetch commits: {e}")
        commit_text = f"(Failed to fetch commits: {e})"

    if job_id:
        db.update_job_status(repo_id, job_id, 'calling_ai', 50, 'Generating changelog with AI...')

    # Generate with AI
    repo_name = f"{owner}/{repo}"
    system, user_prompt = docs_changelog_prompt(repo_name, commit_text)
    result = generate(user_prompt, system=system)

    doc_id = f"changelog_{uuid.uuid4().hex[:8]}"
    doc_data = {
        'mode': 'changelog',
        'content': result['content'],
        'aiProvider': result['provider'],
        'baseRef': base_ref,
        'headRef': head_ref,
    }

    if job_id:
        db.update_job_status(repo_id, job_id, 'saving', 90, 'Saving changelog...')

    db.save_docs(repo_id, doc_id, doc_data)

    if job_id:
        db.update_job_status(repo_id, job_id, 'done', 100, 'Changelog generated!')
        db.clear_job_status(repo_id, job_id)

    return {**doc_data, 'id': doc_id}


def commit_docs_to_github(token, owner, repo, file_path, content, message):
    """Commit generated docs to the repository via GitHub API."""
    try:
        # Check if file already exists to get its SHA
        try:
            existing = gh.get_file_content(token, owner, repo, file_path)
            sha = existing.get('sha')
        except Exception:
            sha = None

        result = gh.create_or_update_file(
            token, owner, repo, file_path, content, message, sha=sha
        )
        return result
    except Exception as e:
        logger.error(f"Failed to commit docs: {e}")
        raise
