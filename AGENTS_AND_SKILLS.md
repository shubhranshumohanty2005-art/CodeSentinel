# CodeSentinel — Custom Agents & Skills

## Custom Agent: Repo Health Agent

### What it does
The Repo Health Agent is an autonomous, multi-step agent that chains multiple
AI calls with GitHub API tool use to generate a comprehensive repository health
report — without a human clicking through each step.

On demand (or on a schedule), it:
1. Pulls all open PRs for a connected repo
2. Runs the `github-diff-summarizer` skill on each PR's diff
3. Pulls all open issues
4. Collects issue metadata (labels, creation date)
5. Calls the AI to produce an executive summary with a health score,
   top action items, and risk assessment
6. Saves the full report to Firestore

### Inputs
- `repo_full` (str): Repository in `"owner/name"` format
- `uid` (str): Firebase user ID (to access their stored GitHub token)
- `job_id` (str, optional): For RTDB progress tracking

### Outputs
A dict containing:
```json
{
  "id": "health_20260804_123456",
  "repoFullName": "owner/repo",
  "healthSummary": "Executive summary text...",
  "prReviews": [
    {
      "number": 42,
      "title": "PR title",
      "summary": "AI-generated summary",
      "risk_level": "low|medium|high",
      "change_type": "feature|bugfix|refactor|docs",
      "provider": "nvidia|gemini|groq"
    }
  ],
  "issueSummaries": [
    {
      "number": 7,
      "title": "Issue title",
      "labels": ["bug"],
      "state": "open"
    }
  ],
  "openPRCount": 3,
  "openIssueCount": 5,
  "aiProvider": "nvidia|gemini|groq",
  "generatedAt": "2026-08-04T12:00:00Z"
}
```

### Where it's implemented
- **Source**: `backend/apps/agents/repo_health_agent.py`
- **Entry point**: `run(repo_full, uid, job_id=None)`
- **API endpoint**: `POST /api/agents/repo-health/run/`
- **Report endpoint**: `GET /api/agents/repo-health/report/<repo_id>/`
- **Views**: `backend/apps/agents/views.py`

### Where it's invoked from
- **Dashboard page** (`frontend/src/pages/Dashboard.jsx`): "Run Health Check" button
- Can also be called programmatically from any backend code

### How to run/test it manually
```bash
# Via API (with a valid Firebase ID token):
curl -X POST http://localhost:8000/api/agents/repo-health/run/ \
  -H "Authorization: Bearer <firebase_id_token>" \
  -H "Content-Type: application/json" \
  -d '{"repo": "owner/repo-name"}'

# Or from Django shell:
python manage.py shell
>>> from apps.agents.repo_health_agent import run
>>> report = run("owner/repo-name", "user-uid")
>>> print(report['healthSummary'])
```

---

## Custom Skill: GitHub Diff Summarizer

### What it does
A reusable, well-documented AI skill that takes a raw git diff and produces
a structured summary including: what changed, which files were affected,
the type of change, risk level, and key bullet points.

### Inputs
- `diff_content` (str): Raw git diff content
- `context` (str, optional): Additional context like PR title/description

### Outputs
A dict containing:
```json
{
  "data": {
    "summary": "One-paragraph description of changes",
    "files_changed": ["file1.py", "file2.js"],
    "change_type": "feature|bugfix|refactor|docs|test|config",
    "risk_level": "low|medium|high",
    "key_changes": [
      "Added new API endpoint for...",
      "Refactored database query to..."
    ]
  },
  "provider": "nvidia|gemini|groq"
}
```

### Where it's implemented
- **Source**: `backend/apps/ai/skills/github_diff_summarizer.py`
- **Entry point**: `summarize_diff(diff_content, context=None)`
- **Skill metadata**: `SKILL_NAME = "github-diff-summarizer"`, `SKILL_VERSION = "1.0.0"`

### Where it's invoked from (demonstrably reused in 2+ places)

1. **PR Review service** (`backend/apps/pr_review/services.py`):
   Used in `analyze_pr()` to generate a high-level summary of the PR diff
   before doing per-file detailed analysis.

2. **Repo Health Agent** (`backend/apps/agents/repo_health_agent.py`):
   Used in `run()` to summarize each open PR's diff when building the
   repo health report.

### How to run/test it manually
```bash
# From Django shell:
python manage.py shell
>>> from apps.ai.skills.github_diff_summarizer import summarize_diff
>>> result = summarize_diff("diff --git a/app.py b/app.py\n+print('hello')")
>>> print(result['data']['summary'])
>>> print(result['provider'])

# Via unit test:
python manage.py test apps.ai.tests.GithubDiffSummarizerSkillTests
```

### Skill Instructions File
The skill has a self-documenting docstring at the top of the module that serves
as its instructions file, documenting:
- Skill name and version
- Input/output contract with types
- Usage example
- Integration points
