"""Docs Generator views."""
import uuid
import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.core import firestore_client as db
from . import services

logger = logging.getLogger(__name__)


@api_view(['POST'])
def generate_docs_view(request):
    """
    POST /api/docs/generate/
    Body: { "repo": "owner/name", "mode": "readme"|"changelog", "base_ref?": "...", "head_ref?": "..." }
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        logger.warning("Docs generate: no user_id on request")
        return Response({'error': 'Not authenticated'}, status=401)

    repo_full = request.data.get('repo', '')
    mode = request.data.get('mode', 'readme')
    base_ref = request.data.get('base_ref', 'main~10')
    head_ref = request.data.get('head_ref', 'main')

    logger.info(f"Docs generate request: uid={uid}, repo='{repo_full}', mode='{mode}'")

    if not repo_full or not repo_full.strip():
        logger.warning(f"Docs generate: empty repo field. Request body: {request.data}")
        return Response({'error': 'Repository name is required (e.g. "owner/repo")'}, status=400)

    parts = repo_full.strip().split('/')
    if len(parts) != 2 or not parts[0] or not parts[1]:
        logger.warning(f"Docs generate: invalid repo format '{repo_full}'")
        return Response({'error': f'repo must be in "owner/name" format, got: "{repo_full}"'}, status=400)

    owner, repo_name = parts
    repo_id = repo_full.replace('/', '_')
    job_id = f"docs_{mode}_{uuid.uuid4().hex[:8]}"

    token = db.get_github_token(uid)
    if not token:
        logger.warning(f"Docs generate: GitHub token not found for uid={uid}")
        return Response({'error': 'GitHub token not found. Please sign out and sign in again to re-authorize.'}, status=400)

    db.update_job_status(repo_id, job_id, 'queued', 0, f'Starting {mode} generation...')

    try:
        if mode == 'changelog':
            result = services.generate_changelog(
                token, owner, repo_name, base_ref, head_ref, repo_id, job_id
            )
        else:
            result = services.generate_readme(
                token, owner, repo_name, repo_id, job_id
            )
        return Response({'result': result, 'job_id': job_id})
    except Exception as e:
        logger.error(f"Docs generation failed: {e}")
        db.update_job_status(repo_id, job_id, 'error', 0, str(e))
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def commit_docs_view(request):
    """
    POST /api/docs/commit/
    Body: { "repo": "owner/name", "file_path": "README.md", "content": "...", "message": "..." }
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    repo_full = request.data.get('repo', '')
    file_path = request.data.get('file_path', 'README.md')
    content = request.data.get('content', '')
    message = request.data.get('message', 'docs: update generated documentation')

    parts = repo_full.split('/')
    if len(parts) != 2:
        return Response({'error': 'Invalid repo format'}, status=400)

    owner, repo_name = parts
    token = db.get_github_token(uid)

    try:
        result = services.commit_docs_to_github(token, owner, repo_name, file_path, content, message)
        return Response({'message': 'Docs committed successfully', 'result': result})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
