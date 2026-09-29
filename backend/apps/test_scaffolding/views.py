"""Test Scaffolding views."""
import uuid
import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.core import firestore_client as db
from . import services

logger = logging.getLogger(__name__)


@api_view(['POST'])
def generate_tests_view(request):
    """
    POST /api/test-scaffolding/generate/
    Body: { "repo": "owner/name", "file_path": "src/utils.py", "function_name?": "my_func" }
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    repo_full = request.data.get('repo', '')
    file_path = request.data.get('file_path', '')
    function_name = request.data.get('function_name')

    if not repo_full or not file_path:
        return Response({'error': 'repo and file_path are required'}, status=400)

    parts = repo_full.split('/')
    if len(parts) != 2:
        return Response({'error': 'repo must be in "owner/name" format'}, status=400)

    owner, repo_name = parts
    repo_id = repo_full.replace('/', '_')
    job_id = f"test_{uuid.uuid4().hex[:8]}"

    token = db.get_github_token(uid)
    if not token:
        return Response({'error': 'GitHub token not found. Please sign out and sign in again to re-authorize.'}, status=400)

    db.update_job_status(repo_id, job_id, 'queued', 0, 'Starting test generation...')

    try:
        result = services.generate_tests(
            token, owner, repo_name, file_path, repo_id, function_name, job_id
        )
        return Response({'result': result, 'job_id': job_id})
    except Exception as e:
        logger.error(f"Test generation failed: {e}")
        db.update_job_status(repo_id, job_id, 'error', 0, str(e))
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def commit_test_view(request):
    """
    POST /api/test-scaffolding/commit/
    Body: { "repo": "owner/name", "test_path": "tests/test_utils.py", "content": "...", "message": "..." }
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    repo_full = request.data.get('repo', '')
    test_path = request.data.get('test_path', '')
    content = request.data.get('content', '')
    message = request.data.get('message', 'test: add generated unit tests')

    parts = repo_full.split('/')
    if len(parts) != 2:
        return Response({'error': 'Invalid repo format'}, status=400)

    owner, repo_name = parts
    token = db.get_github_token(uid)

    try:
        result = services.commit_test_to_github(token, owner, repo_name, test_path, content, message)
        return Response({'message': 'Test file committed successfully', 'result': result})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
