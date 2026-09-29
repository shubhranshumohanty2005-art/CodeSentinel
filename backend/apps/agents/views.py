"""Agents views — Repo Health Agent endpoints."""
import uuid
import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.core import firestore_client as db
from . import repo_health_agent

logger = logging.getLogger(__name__)


@api_view(['POST'])
def run_health_agent_view(request):
    """
    POST /api/agents/repo-health/run/
    Body: { "repo": "owner/name" }
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    repo_full = request.data.get('repo', '')
    if not repo_full or '/' not in repo_full:
        return Response({'error': 'repo must be in "owner/name" format'}, status=400)

    repo_id = repo_full.replace('/', '_')
    job_id = f"health_{uuid.uuid4().hex[:8]}"

    db.update_job_status(repo_id, job_id, 'queued', 0, 'Starting health agent...')

    try:
        report = repo_health_agent.run(repo_full, uid, job_id)
        return Response({'report': report, 'job_id': job_id})
    except Exception as e:
        logger.error(f"Health agent failed: {e}")
        db.update_job_status(repo_id, job_id, 'error', 0, str(e))
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_health_report_view(request, repo_id):
    """GET /api/agents/repo-health/report/<repo_id>/"""
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    report = db.get_latest_health_report(repo_id)
    if not report:
        return Response({'error': 'No health report found'}, status=404)

    return Response({'report': report})
