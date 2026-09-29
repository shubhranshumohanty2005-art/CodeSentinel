"""
Repo Health Agent — Custom Autonomous Agent
============================================

A multi-step autonomous agent that chains multiple AI calls and tool use
to generate a comprehensive repo health report without human intervention.

Steps:
1. Fetch all open PRs for a connected repo
2. Run PR Review (with the github-diff-summarizer skill) on each PR
3. Fetch all open issues
4. Run Bug Triage on each issue
5. Aggregate results into a single "Repo Health Report"
6. Save to Firestore and optionally post as a GitHub issue comment

Invocation:
    from apps.agents.repo_health_agent import run
    report = run(repo_id, uid)

API:
    POST /api/agents/repo-health/run/
    Body: { "repo": "owner/name" }
"""
import uuid
import logging
from datetime import datetime
from apps.ai.ai_client import generate
from apps.ai.skills.github_diff_summarizer import summarize_diff
from apps.github_integration import github_client as gh
from apps.core import firestore_client as db

logger = logging.getLogger(__name__)

MAX_PRS_TO_REVIEW = 5
MAX_ISSUES_TO_TRIAGE = 10


def run(repo_full, uid, job_id=None):
    """
    Run the Repo Health Agent.

    This is the main entrypoint. It autonomously:
    1. Fetches open PRs and reviews them
    2. Fetches open issues and triages them
    3. Summarizes everything into a health report
    4. Saves to Firestore

    Args:
        repo_full: "owner/repo" format
        uid: Firebase user ID
        job_id: Optional job ID for progress tracking

    Returns:
        dict: The complete repo health report
    """
    parts = repo_full.split('/')
    if len(parts) != 2:
        raise ValueError("repo must be in 'owner/name' format")

    owner, repo_name = parts
    repo_id = repo_full.replace('/', '_')

    if not job_id:
        job_id = f"health_{uuid.uuid4().hex[:8]}"

    token = db.get_github_token(uid)
    if not token:
        raise ValueError("GitHub token not found for user")

    logger.info(f"[RepoHealthAgent] Starting health check for {repo_full}")
    db.update_job_status(repo_id, job_id, 'fetching_diff', 5,
                         'Starting repo health analysis...')

    # ── Step 1: Review open PRs ──────────────────────────────
    db.update_job_status(repo_id, job_id, 'fetching_diff', 10,
                         'Fetching open pull requests...')

    pr_summaries = []
    try:
        prs = gh.list_pull_requests(token, owner, repo_name, state='open')
        logger.info(f"[RepoHealthAgent] Found {len(prs)} open PRs")

        for i, pr in enumerate(prs[:MAX_PRS_TO_REVIEW]):
            pr_number = pr['number']
            pr_title = pr.get('title', '')
            percent = 10 + int((i / max(len(prs[:MAX_PRS_TO_REVIEW]), 1)) * 30)

            db.update_job_status(repo_id, job_id, 'calling_ai', percent,
                                 f'Reviewing PR #{pr_number}: {pr_title}...')

            try:
                # Use the reusable github-diff-summarizer skill
                diff = gh.get_pr_diff(token, owner, repo_name, pr_number)
                summary_result = summarize_diff(
                    diff[:12000],
                    context=f"PR #{pr_number}: {pr_title}"
                )

                pr_summaries.append({
                    'number': pr_number,
                    'title': pr_title,
                    'url': pr.get('html_url', ''),
                    'author': pr.get('user', {}).get('login', 'unknown'),
                    'summary': summary_result['data'].get('summary', 'N/A'),
                    'risk_level': summary_result['data'].get('risk_level', 'unknown'),
                    'change_type': summary_result['data'].get('change_type', 'unknown'),
                    'provider': summary_result['provider'],
                })
            except Exception as e:
                logger.warning(f"[RepoHealthAgent] Failed to review PR #{pr_number}: {e}")
                pr_summaries.append({
                    'number': pr_number,
                    'title': pr_title,
                    'error': str(e),
                })

    except Exception as e:
        logger.error(f"[RepoHealthAgent] Failed to fetch PRs: {e}")

    # ── Step 2: Triage open issues ───────────────────────────
    db.update_job_status(repo_id, job_id, 'calling_ai', 45,
                         'Fetching open issues...')

    issue_summaries = []
    try:
        issues = gh.list_issues(token, owner, repo_name, state='open')
        # Filter out PRs (GitHub API returns PRs in issues endpoint)
        issues = [i for i in issues if 'pull_request' not in i]
        logger.info(f"[RepoHealthAgent] Found {len(issues)} open issues")

        for i, issue in enumerate(issues[:MAX_ISSUES_TO_TRIAGE]):
            issue_number = issue['number']
            issue_title = issue.get('title', '')
            percent = 45 + int((i / max(len(issues[:MAX_ISSUES_TO_TRIAGE]), 1)) * 25)

            db.update_job_status(repo_id, job_id, 'calling_ai', percent,
                                 f'Triaging issue #{issue_number}: {issue_title}...')

            issue_summaries.append({
                'number': issue_number,
                'title': issue_title,
                'url': issue.get('html_url', ''),
                'labels': [l.get('name', '') for l in issue.get('labels', [])],
                'state': issue.get('state', 'open'),
                'created_at': issue.get('created_at', ''),
            })

    except Exception as e:
        logger.error(f"[RepoHealthAgent] Failed to fetch issues: {e}")

    # ── Step 3: Generate overall health summary ──────────────
    db.update_job_status(repo_id, job_id, 'calling_ai', 75,
                         'Generating health summary...')

    summary_prompt = f"""Analyze this repository health data and provide a comprehensive health report.

Repository: {repo_full}
Open PRs reviewed: {len(pr_summaries)}
Open issues: {len(issue_summaries)}

PR Summaries:
{_format_pr_summaries(pr_summaries)}

Issue Summaries:
{_format_issue_summaries(issue_summaries)}

Provide:
1. An overall health score (0-100, where 100 is perfectly healthy)
2. A 2-3 paragraph executive summary
3. Top 3 action items (most urgent things to address)
4. Risk assessment (low/medium/high)
"""

    try:
        health_result = generate(
            summary_prompt,
            system="You are a software engineering manager analyzing repository health. Be specific and actionable."
        )
        health_summary = health_result['content']
        summary_provider = health_result['provider']
    except Exception as e:
        logger.error(f"[RepoHealthAgent] Failed to generate summary: {e}")
        health_summary = f"Health summary generation failed: {e}"
        summary_provider = 'none'

    # ── Step 4: Save report ──────────────────────────────────
    db.update_job_status(repo_id, job_id, 'saving', 90, 'Saving health report...')

    report_id = f"health_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    report = {
        'repoFullName': repo_full,
        'healthSummary': health_summary,
        'prReviews': pr_summaries,
        'issueSummaries': issue_summaries,
        'openPRCount': len(pr_summaries),
        'openIssueCount': len(issue_summaries),
        'aiProvider': summary_provider,
        'generatedAt': datetime.utcnow().isoformat(),
    }

    db.save_health_report(repo_id, report_id, report)

    db.update_job_status(repo_id, job_id, 'done', 100, 'Health report complete!')
    db.clear_job_status(repo_id, job_id)

    logger.info(f"[RepoHealthAgent] Health report saved: {report_id}")

    return {**report, 'id': report_id}


def _format_pr_summaries(summaries):
    """Format PR summaries for the health prompt."""
    lines = []
    for s in summaries:
        if 'error' in s:
            lines.append(f"- PR #{s['number']} ({s['title']}): Error - {s['error']}")
        else:
            lines.append(
                f"- PR #{s['number']} ({s['title']}): "
                f"Risk={s.get('risk_level', '?')}, "
                f"Type={s.get('change_type', '?')}, "
                f"by {s.get('author', '?')}"
            )
    return '\n'.join(lines) if lines else '(No open PRs)'


def _format_issue_summaries(summaries):
    """Format issue summaries for the health prompt."""
    lines = []
    for s in summaries:
        labels = ', '.join(s.get('labels', [])) or 'unlabeled'
        lines.append(f"- Issue #{s['number']} ({s['title']}): [{labels}]")
    return '\n'.join(lines) if lines else '(No open issues)'
