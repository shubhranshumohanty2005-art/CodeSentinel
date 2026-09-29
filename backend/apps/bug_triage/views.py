"""Bug Triage views."""
import uuid
import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.core import firestore_client as db
from . import services

logger = logging.getLogger(__name__)


@api_view(['POST'])
def analyze_issue_view(request):
    """
    POST /api/bug-triage/analyze/
    Body: { "repo": "owner/name", "issue_number": 42 }
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    repo_full = request.data.get('repo', '')
    issue_number = request.data.get('issue_number')

    if not repo_full or not issue_number:
        return Response({'error': 'repo and issue_number are required'}, status=400)

    parts = repo_full.split('/')
    if len(parts) != 2:
        return Response({'error': 'repo must be in "owner/name" format'}, status=400)

    owner, repo_name = parts
    repo_id = repo_full.replace('/', '_')
    job_id = f"triage_{issue_number}_{uuid.uuid4().hex[:8]}"

    token = db.get_github_token(uid)
    if not token:
        return Response({'error': 'GitHub token not found. Please sign out and sign in again to re-authorize.'}, status=400)

    db.update_job_status(repo_id, job_id, 'queued', 0, 'Starting triage...')

    try:
        report = services.analyze_issue(
            token, owner, repo_name, issue_number, repo_id, job_id
        )
        return Response({'report': report, 'job_id': job_id})
    except Exception as e:
        logger.error(f"Triage failed: {e}")
        db.update_job_status(repo_id, job_id, 'error', 0, str(e))
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def apply_labels_view(request):
    """
    POST /api/bug-triage/apply-labels/
    Body: { "repo": "owner/name", "issue_number": 42, "labels": ["bug", "P2"] }
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    repo_full = request.data.get('repo', '')
    issue_number = request.data.get('issue_number')
    labels = request.data.get('labels', [])

    parts = repo_full.split('/')
    if len(parts) != 2:
        return Response({'error': 'Invalid repo format'}, status=400)

    owner, repo_name = parts
    token = db.get_github_token(uid)

    try:
        services.apply_labels_to_github(token, owner, repo_name, issue_number, labels)
        return Response({'message': 'Labels applied successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
