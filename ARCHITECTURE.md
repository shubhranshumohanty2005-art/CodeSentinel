# CodeSentinel Architecture

## Overview

CodeSentinel is an AI co-pilot for software teams, built as a monorepo with a
React frontend and Django backend, using Firebase for data persistence and
authentication, and a triple-provider AI fallback chain for reliability.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Docker Compose                              │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Frontend    │    │   Backend    │    │    Redis     │          │
│  │  React/Vite   │───▶│ Django/DRF   │───▶│   Cache     │          │
│  │  :5173        │    │  :8000       │    │  :6379       │          │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘          │
│         │                    │                                       │
└─────────┼────────────────────┼───────────────────────────────────────┘
          │                    │
          ▼                    ▼
┌──────────────┐    ┌──────────────────────────────────────┐
│  Firebase     │    │         External APIs                │
│  ┌──────────┐ │    │  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ Auth     │ │    │  │ GitHub │ │ NVIDIA │ │ Gemini │  │
│  │ (GitHub) │ │    │  │ REST   │ │  NIM   │ │  API   │  │
│  ├──────────┤ │    │  │  API   │ │        │ │        │  │
│  │Firestore │ │    │  └────────┘ └────────┘ └────────┘  │
│  │ (Data)   │ │    │                         ┌────────┐  │
│  ├──────────┤ │    │                         │  Groq  │  │
│  │ Realtime │ │    │                         │  API   │  │
│  │   DB     │ │    │                         └────────┘  │
│  │ (Live UI)│ │    └──────────────────────────────────────┘
│  └──────────┘ │
└──────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite 5 | SPA framework and build tool |
| UI | TailwindCSS + Framer Motion | Styling and animations |
| 3D | Three.js (react-three-fiber) | Animated hero on landing page |
| Backend | Django 4.2 + DRF | REST API server |
| Server | Gunicorn | Production WSGI server |
| Auth | Firebase Auth (GitHub OAuth) | Identity and authentication |
| Database | Cloud Firestore | System-of-record data store |
| Live Data | Firebase Realtime Database | Job progress and presence |
| Cache | Redis 7 | GitHub API response caching |
| AI (Primary) | NVIDIA NIM API | Code analysis and generation |
| AI (Fallback 1) | Google Gemini API | Planning and summarization |
| AI (Fallback 2) | Groq API | Fast last-resort fallback |
| Container | Docker + Docker Compose | Development and deployment |

## Data Model (Firestore)

```
users/{uid}
├── githubLogin: string
├── githubTokenEncrypted: string
├── createdAt: string
├── updatedAt: string
└── repos/{repoId}
    ├── fullName: string
    └── connectedAt: string

repos/{repoId}
├── pr_reviews/{prNumber}
│   ├── summary: string
│   ├── riskScore: number (0-100)
│   ├── comments: [{file, line, severity, comment}]
│   ├── aiProvider: string
│   └── createdAt: string
├── docs/{docId}
│   ├── mode: "readme" | "changelog"
│   ├── content: string (Markdown)
│   ├── aiProvider: string
│   └── createdAt: string
├── triage/{issueNumber}
│   ├── labels: string[]
│   ├── severity: "P0" | "P1" | "P2" | "P3"
│   ├── likelyOwner: string
│   ├── duplicateOf: number | null
│   ├── aiProvider: string
│   └── createdAt: string
├── tests/{testId}
│   ├── filePath: string
│   ├── generatedTest: string
│   ├── aiProvider: string
│   └── createdAt: string
└── health_reports/{reportId}
    ├── healthSummary: string
    ├── prReviews: object[]
    ├── issueSummaries: object[]
    ├── aiProvider: string
    └── createdAt: string
```

## Realtime Database (Ephemeral)

```
job_status/{repoId}/{jobId}
├── type: "pr_review" | "docs" | "triage" | "test_scaffold"
├── status: "queued" | "fetching_diff" | "calling_ai" | "saving" | "done" | "error"
├── percent: number (0-100)
├── message: string
└── updatedAt: timestamp

presence/{repoId}/{uid}
├── online: boolean
└── lastActive: timestamp
```

## Request Flows

### PR Review Flow

```
User → Frontend (PRReview.jsx)
  → POST /api/pr-review/analyze/ {repo, pr_number}
    → Backend verifies Firebase ID token
    → Loads user's GitHub token from Firestore
    → Updates RTDB: job_status → "fetching_diff"
    → Fetches PR diff via GitHub REST API (cached in Redis)
    → Updates RTDB: job_status → "calling_ai"
    → Invokes github-diff-summarizer skill
    → Chunks diff per file
    → Calls ai_client.generate() per chunk (NVIDIA → Gemini → Groq)
    → Aggregates comments and risk score
    → Updates RTDB: job_status → "saving"
    → Saves report to Firestore: repos/{repoId}/pr_reviews/{prNumber}
    → Updates RTDB: job_status → "done", then clears
    → Returns report to frontend
  → Frontend shows risk gauge + inline comments
  → User clicks "Post to GitHub"
    → POST /api/pr-review/post-to-github/
    → Backend posts review via GitHub Reviews API
```

### Docs & Changelog Flow

```
User → DocsGenerator.jsx
  → POST /api/docs/generate/ {repo, mode, base_ref?, head_ref?}
    → Fetch repo tree / commits via GitHub API
    → Call ai_client.generate() with prompt template
    → Save to Firestore: repos/{repoId}/docs/{docId}
    → Return generated Markdown
  → Frontend shows Markdown preview
  → User can Copy or "Commit to repo via GitHub API"
```

### Bug Triage Flow

```
User → BugTriage.jsx
  → POST /api/bug-triage/analyze/ {repo, issue_number}
    → Fetch issue body from GitHub
    → Extract file paths from stack traces
    → Find recent commit authors for those files
    → Run keyword-based duplicate check against open issues
    → Call ai_client.generate_json() for label/severity/owner
    → Save to Firestore: repos/{repoId}/triage/{issueNumber}
    → Return triage results
  → Frontend shows severity, labels, owner, duplicates
  → User clicks "Apply labels to GitHub issue"
```

### Test Scaffolding Flow

```
User → TestScaffolding.jsx
  → POST /api/test-scaffolding/generate/ {repo, file_path, function_name?}
    → Detect language from file extension
    → Detect test framework from repo config
    → Fetch source file content from GitHub
    → Call ai_client.generate() with test generation prompt
    → Save to Firestore: repos/{repoId}/tests/{testId}
    → Return generated test code
  → Frontend shows syntax-highlighted test code
  → User can Copy or "Create file via GitHub API"
```

### Repo Health Agent Flow

```
Trigger (API or scheduled) → repo_health_agent.run(repo_id)
  → Fetch all open PRs via GitHub API
  → For each PR (up to 5):
    → Invoke github-diff-summarizer skill
    → Collect summary, risk level, change type
  → Fetch all open issues via GitHub API
  → Collect issue summaries
  → Call ai_client.generate() for overall health summary
  → Save to Firestore: repos/{repoId}/health_reports/{reportId}
  → Return comprehensive health report
```

## AI Fallback Chain

```
Request → ai_client.generate()
  ├── Try: NVIDIA NIM API (meta/llama-3.1-70b-instruct)
  │   ├── Success → return {content, provider: "nvidia"}
  │   └── Fail (timeout/429/5xx) → continue
  ├── Try: Google Gemini API (gemini-1.5-flash)
  │   ├── Success → return {content, provider: "gemini"}
  │   └── Fail → continue
  ├── Try: Groq API (llama-3.1-70b-versatile)
  │   ├── Success → return {content, provider: "groq"}
  │   └── Fail → raise RuntimeError
  └── All failed → RuntimeError("All AI providers failed")
```

Every AI-generated result stored in Firestore records which provider produced it
via the `aiProvider` field.
