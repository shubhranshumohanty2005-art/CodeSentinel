"""
Test Scaffolding Generator service.

Detects language, test framework, and generates comprehensive unit tests.
"""
import uuid
import logging
from apps.ai.ai_client import generate
from apps.ai.prompts.templates import test_scaffolding_prompt
from apps.github_integration import github_client as gh
from apps.core import firestore_client as db

logger = logging.getLogger(__name__)

# Language detection by file extension
LANGUAGE_MAP = {
    '.py': 'python',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.java': 'java',
    '.go': 'go',
    '.rb': 'ruby',
    '.rs': 'rust',
    '.cpp': 'cpp',
    '.c': 'c',
    '.cs': 'csharp',
    '.php': 'php',
    '.swift': 'swift',
    '.kt': 'kotlin',
}

# Test framework detection
FRAMEWORK_DETECTORS = {
    'python': {
        'files': ['pytest.ini', 'setup.cfg', 'pyproject.toml', 'conftest.py'],
        'requirements_keywords': ['pytest'],
        'default': 'pytest',
    },
    'javascript': {
        'package_keywords': ['jest', 'vitest', 'mocha', 'jasmine'],
        'default': 'jest',
    },
    'typescript': {
        'package_keywords': ['jest', 'vitest', 'mocha'],
        'default': 'jest',
    },
    'java': {'default': 'junit'},
    'go': {'default': 'testing'},
    'ruby': {'default': 'rspec'},
    'rust': {'default': 'cargo test'},
    'cpp': {'default': 'gtest'},
    'csharp': {'default': 'xunit'},
}


def _detect_language(file_path):
    """Detect programming language from file extension."""
    for ext, lang in LANGUAGE_MAP.items():
        if file_path.endswith(ext):
            return lang
    return 'unknown'


def _detect_test_framework(token, owner, repo, language):
    """Detect the test framework used in the repo (legacy, uses individual API calls)."""
    return _detect_test_framework_fast(token, owner, repo, language, set())


def _detect_test_framework_fast(token, owner, repo, language, tree_paths):
    """Detect the test framework used in the repo using pre-fetched tree paths for speed."""
    detector = FRAMEWORK_DETECTORS.get(language, {})

    # For Python, check for pytest markers via tree (no API calls needed)
    if language == 'python':
        for check_file in detector.get('files', []):
            if check_file in tree_paths:
                return 'pytest'

        # Only read requirements.txt if it exists in the tree
        if 'requirements.txt' in tree_paths:
            try:
                req = gh.get_file_content(token, owner, repo, 'requirements.txt')
                content = req.get('decoded_content', '')
                for kw in detector.get('requirements_keywords', []):
                    if kw in content.lower():
                        return kw
            except Exception:
                pass

    # For JS/TS, check package.json (only one API call)
    if language in ('javascript', 'typescript'):
        if 'package.json' in tree_paths or not tree_paths:
            try:
                pkg = gh.get_file_content(token, owner, repo, 'package.json')
                content = pkg.get('decoded_content', '')
                for kw in detector.get('package_keywords', []):
                    if kw in content.lower():
                        return kw
            except Exception:
                pass

    return detector.get('default', 'unknown')


def generate_tests(token, owner, repo, file_path, repo_id, function_name=None, job_id=None):
    """
    Generate unit tests for a file or function.

    1. Detect language and test framework
    2. Fetch the source file
    3. Call AI to generate tests
    4. Save to Firestore
    """
    if job_id:
        db.update_job_status(repo_id, job_id, 'fetching_diff', 10, 'Fetching source file...')

    # Detect language
    language = _detect_language(file_path)
    if language == 'unknown':
        raise ValueError(f"Unsupported file type: {file_path}")

    # Fetch the source file
    try:
        file_data = gh.get_file_content(token, owner, repo, file_path)
        file_content = file_data.get('decoded_content', '')
    except Exception as e:
        logger.error(f"Failed to fetch file: {e}")
        raise

    if job_id:
        db.update_job_status(repo_id, job_id, 'fetching_diff', 30, 'Detecting test framework...')

    # Detect test framework using the repo tree (avoids multiple API calls)
    try:
        tree_data = gh.get_repo_tree(token, owner, repo)
        tree_paths = {item['path'] for item in tree_data.get('tree', [])}
    except Exception:
        tree_paths = set()

    test_framework = _detect_test_framework_fast(token, owner, repo, language, tree_paths)

    if job_id:
        db.update_job_status(repo_id, job_id, 'calling_ai', 50, f'Generating {test_framework} tests with AI...')

    # Generate tests with AI
    system, user_prompt = test_scaffolding_prompt(
        file_content, file_path, language, test_framework, function_name
    )
    result = generate(user_prompt, system=system)

    test_id = f"test_{uuid.uuid4().hex[:8]}"
    test_data = {
        'filePath': file_path,
        'generatedTest': result['content'],
        'language': language,
        'testFramework': test_framework,
        'functionName': function_name,
        'aiProvider': result['provider'],
    }

    if job_id:
        db.update_job_status(repo_id, job_id, 'saving', 90, 'Saving generated tests...')

    db.save_test(repo_id, test_id, test_data)

    if job_id:
        db.update_job_status(repo_id, job_id, 'done', 100, 'Tests generated!')
        db.clear_job_status(repo_id, job_id)

    return {**test_data, 'id': test_id}


def commit_test_to_github(token, owner, repo, test_path, content, message):
    """Commit generated test file to the repository."""
    try:
        result = gh.create_or_update_file(
            token, owner, repo, test_path, content, message
        )
        return result
    except Exception as e:
        logger.error(f"Failed to commit test file: {e}")
        raise
