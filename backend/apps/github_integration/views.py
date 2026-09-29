"""GitHub integration views — repo listing and connection management."""
import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.core import firestore_client as db
from . import github_client as gh

logger = logging.getLogger(__name__)


@api_view(['GET'])
def list_repos(request):
    """GET /api/github/repos/ — List the user's GitHub repos."""
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    token = db.get_github_token(uid)
    if not token:
        return Response({'error': 'GitHub token not found. Please re-authenticate.'}, status=400)

    cache_key = f"user_repos_{uid}"
    from django.core.cache import cache
    cached_response = cache.get(cache_key)
    if cached_response:
        return Response(cached_response)

    try:
        repos = gh.list_user_repos(token)
        connected = db.get_user_repos(uid)
        connected_ids = {r['id'] for r in connected}

        result = []
        for repo in repos:
            result.append({
                'id': str(repo['id']),
                'full_name': repo['full_name'],
                'name': repo['name'],
                'owner': repo['owner']['login'],
                'description': repo.get('description', ''),
                'language': repo.get('language', ''),
                'private': repo['private'],
                'updated_at': repo.get('updated_at', ''),
                'connected': str(repo['id']) in connected_ids,
            })

        response_data = {'repos': result}
        cache.set(cache_key, response_data, 300) # Cache for 5 minutes
        return Response(response_data)
    except Exception as e:
        logger.error(f"Failed to list repos: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def connect_repo(request):
    """POST /api/github/repos/connect/ — Connect a repo to the user's account."""
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    repo_id = request.data.get('repo_id')
    full_name = request.data.get('full_name')

    if not repo_id or not full_name:
        return Response({'error': 'repo_id and full_name are required'}, status=400)

    db.connect_repo(uid, str(repo_id), {'fullName': full_name})
    from django.core.cache import cache
    cache.delete(f"user_repos_{uid}")
    return Response({'message': f'Connected {full_name}'})


@api_view(['POST'])
def disconnect_repo(request):
    """POST /api/github/repos/disconnect/ — Disconnect a repo."""
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    repo_id = request.data.get('repo_id')
    if not repo_id:
        return Response({'error': 'repo_id is required'}, status=400)

    db.disconnect_repo(uid, str(repo_id))
    from django.core.cache import cache
    cache.delete(f"user_repos_{uid}")
    return Response({'message': 'Disconnected successfully'})
