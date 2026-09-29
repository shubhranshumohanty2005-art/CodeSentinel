"""
GitHub REST API client wrapper.

Provides methods for all GitHub API interactions needed by CodeSentinel:
- List user repos
- Get PR diff
- Post PR review comments
- List issues
- Get commit history
- Get file contents
- Create commits/files

All methods accept a `token` parameter — the user's GitHub OAuth access token.
Results are cached in Redis for 60 seconds to respect rate limits.
"""
import json
import hashlib
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

GITHUB_API_BASE = "https://api.github.com"
CACHE_TTL = 60  # seconds

_redis_client = None


def _get_redis():
    """Get or create a Redis client for caching."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client

    try:
        import redis
        _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        _redis_client.ping()
        return _redis_client
    except Exception as e:
        logger.warning(f"Redis not available for caching: {e}")
        return None


def _cache_key(method, url, params=None):
    """Generate a cache key for a GitHub API request."""
    raw = f"{method}:{url}:{json.dumps(params or {}, sort_keys=True)}"
    return f"gh_cache:{hashlib.md5(raw.encode()).hexdigest()}"


def _cached_get(url, token, params=None):
    """GET with Redis caching."""
    cache = _get_redis()
    key = _cache_key("GET", url, params)

    # Try cache first
    if cache:
        try:
            cached = cache.get(key)
            if cached:
                logger.debug(f"Cache hit: {url}")
                return json.loads(cached)
        except Exception:
            pass

    # Make the actual request
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    response = requests.get(url, headers=headers, params=params, timeout=30)
    response.raise_for_status()
    data = response.json()

    # Cache the result
    if cache:
        try:
            cache.setex(key, CACHE_TTL, json.dumps(data))
        except Exception:
            pass

    return data


def _github_request(method, url, token, data=None, headers_extra=None):
    """Make an authenticated GitHub API request (no caching)."""
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    if headers_extra:
        headers.update(headers_extra)

    response = requests.request(
        method, url, headers=headers, json=data, timeout=30
    )
    response.raise_for_status()
    if response.status_code == 204:
        return {}
    return response.json()


# ── Repository Operations ─────────────────────────────────────

def list_user_repos(token, per_page=100):
    """List all repos accessible to the authenticated user."""
    url = f"{GITHUB_API_BASE}/user/repos"
    return _cached_get(url, token, {"per_page": per_page, "sort": "updated"})


def get_repo(token, owner, repo):
    """Get details of a specific repository."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
    return _cached_get(url, token)


def get_repo_tree(token, owner, repo, ref="main"):
    """Get the file tree of a repository."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/git/trees/{ref}"
    return _cached_get(url, token, {"recursive": "1"})


def get_file_content(token, owner, repo, path, ref="main"):
    """Get the content of a specific file."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    data = _cached_get(url, token, {"ref": ref})
    if data.get("encoding") == "base64":
        import base64
        data["decoded_content"] = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
    return data


# ── Pull Request Operations ───────────────────────────────────

def list_pull_requests(token, owner, repo, state="open"):
    """List pull requests for a repository."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/pulls"
    return _cached_get(url, token, {"state": state, "per_page": 30})


def get_pull_request(token, owner, repo, pr_number):
    """Get a specific pull request."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/pulls/{pr_number}"
    return _cached_get(url, token)


def get_pr_diff(token, owner, repo, pr_number):
    """Get the diff of a pull request."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/pulls/{pr_number}"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3.diff",
    }
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    return response.text


def get_pr_files(token, owner, repo, pr_number):
    """Get the list of files changed in a PR."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/pulls/{pr_number}/files"
    return _cached_get(url, token, {"per_page": 100})


def post_pr_review(token, owner, repo, pr_number, body, comments=None, event="COMMENT"):
    """Post a review on a pull request."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/pulls/{pr_number}/reviews"
    data = {
        "body": body,
        "event": event,
    }
    if comments:
        data["comments"] = comments
    return _github_request("POST", url, token, data)


# ── Issue Operations ──────────────────────────────────────────

def list_issues(token, owner, repo, state="open", per_page=30):
    """List issues for a repository."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/issues"
    return _cached_get(url, token, {"state": state, "per_page": per_page})


def get_issue(token, owner, repo, issue_number):
    """Get a specific issue."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/issues/{issue_number}"
    return _cached_get(url, token)


def add_issue_labels(token, owner, repo, issue_number, labels):
    """Add labels to an issue."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/issues/{issue_number}/labels"
    return _github_request("POST", url, token, {"labels": labels})


def post_issue_comment(token, owner, repo, issue_number, body):
    """Post a comment on an issue."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/issues/{issue_number}/comments"
    return _github_request("POST", url, token, {"body": body})


# ── Commit Operations ─────────────────────────────────────────

def list_commits(token, owner, repo, path=None, per_page=30, sha=None):
    """List commits for a repository, optionally filtered by path."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/commits"
    params = {"per_page": per_page}
    if path:
        params["path"] = path
    if sha:
        params["sha"] = sha
    return _cached_get(url, token, params)


def get_commits_between(token, owner, repo, base, head):
    """Get commits between two refs."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/compare/{base}...{head}"
    return _cached_get(url, token)


# ── File Creation ─────────────────────────────────────────────

def create_or_update_file(token, owner, repo, path, content, message, branch="main", sha=None):
    """Create or update a file in a repository."""
    import base64
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    data = {
        "message": message,
        "content": base64.b64encode(content.encode()).decode(),
        "branch": branch,
    }
    if sha:
        data["sha"] = sha
    return _github_request("PUT", url, token, data)
