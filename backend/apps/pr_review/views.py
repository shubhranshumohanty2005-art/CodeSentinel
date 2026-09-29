"""PR Review views — analyze PRs and post comments to GitHub."""
import uuid
import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.core import firestore_client as db
from . import services

logger = logging.getLogger(__name__)


@api_view(['POST'])
def analyze_pr_view(request):
    """
    POST /api/pr-review/analyze/
    Body: { "repo": "owner/name", "pr_number": 123 }
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    repo_full = request.data.get('repo', '')
    pr_number = request.data.get('pr_number')

    if not repo_full or not pr_number:
        return Response({'error': 'repo and pr_number are required'}, status=400)

    parts = repo_full.split('/')
    if len(parts) != 2:
        return Response({'error': 'repo must be in "owner/name" format'}, status=400)

    owner, repo_name = parts
    repo_id = repo_full.replace('/', '_')
    job_id = f"pr_review_{pr_number}_{uuid.uuid4().hex[:8]}"

    token = db.get_github_token(uid)
    if not token:
        return Response({'error': 'GitHub token not found. Please sign out and sign in again to re-authorize.'}, status=400)

    # Initialize job status
    db.update_job_status(repo_id, job_id, 'queued', 0, 'Starting PR review...')

    try:
        report = services.analyze_pr(
            token, owner, repo_name, pr_number, repo_id, job_id
        )
        return Response({
            'report': report,
            'job_id': job_id,
        })
    except Exception as e:
        logger.error(f"PR review failed: {e}")
        db.update_job_status(repo_id, job_id, 'error', 0, str(e))
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def post_to_github_view(request):
    """
    POST /api/pr-review/post-to-github/
    Body: { "repo": "owner/name", "pr_number": 123 }
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    repo_full = request.data.get('repo', '')
    pr_number = request.data.get('pr_number')
    parts = repo_full.split('/')
    if len(parts) != 2:
        return Response({'error': 'Invalid repo format'}, status=400)

    owner, repo_name = parts
    repo_id = repo_full.replace('/', '_')
    token = db.get_github_token(uid)

    report = db.get_pr_review(repo_id, pr_number)
    if not report:
        return Response({'error': 'No review report found. Run analysis first.'}, status=404)

    try:
        services.post_review_to_github(token, owner, repo_name, pr_number, report)
        return Response({'message': 'Review posted to GitHub successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_report_view(request, repo_id, pr_number):
    """GET /api/pr-review/report/<repo_id>/<pr_number>/"""
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    report = db.get_pr_review(repo_id, pr_number)
    if not report:
        return Response({'error': 'Report not found'}, status=404)

    return Response({'report': report})
