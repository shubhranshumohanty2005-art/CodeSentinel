# 🛡️ CodeSentinel

> AI co-pilot for software teams — PR reviews, docs generation, bug triage,
> and test scaffolding powered by a triple-AI fallback chain.

---

## Features

| Feature | Description |
|---------|-------------|
| 🔍 **PR Reviewer** | AI-powered line-level code review with risk scoring |
| 📝 **Docs & Changelog** | Auto-generate README and changelog from repo content |
| 🐛 **Bug Triage** | Smart label, severity, and owner suggestions for issues |
| 🧪 **Test Generator** | Generate unit tests in your project's existing framework |
| 🤖 **Repo Health Agent** | Autonomous multi-step agent for comprehensive repo analysis |

## Tech Stack

- **Frontend**: React 18 + Vite 5 + TailwindCSS + Three.js + Framer Motion
- **Backend**: Django 4.2 + Django REST Framework + Gunicorn
- **Database**: Firebase (Firestore + Realtime Database + Auth)
- **AI Chain**: NVIDIA NIM → Google Gemini → Groq (automatic fallback)
- **Cache**: Redis 7
- **Container**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- A Firebase project with:
  - GitHub auth provider enabled
  - Firestore database created
  - Realtime Database created
  - Service account JSON downloaded

### Setup

1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd codesentinel
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Add Firebase service account:**
   ```bash
   # Download from Firebase Console → Project Settings → Service Accounts
   # Save to: backend/firebase-service-account.json
   ```

4. **Start the app:**
   ```bash
   docker compose up --build
   # Or on Windows: RUN.BAT
   ```

5. **Access:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api

### Required Environment Variables

| Variable | Description | Where to get |
|----------|-------------|-------------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console |
| `FIREBASE_ADMIN_SDK_JSON_PATH` | Path to service account JSON | Firebase Console → Service Accounts |
| `FIREBASE_RTDB_URL` | Realtime Database URL | Firebase Console → Realtime Database |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID | GitHub Developer Settings |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App secret | GitHub Developer Settings |
| `NVIDIA_API_KEY` | NVIDIA NIM API key | build.nvidia.com |
| `GEMINI_API_KEY` | Google Gemini API key | aistudio.google.com |
| `GROQ_API_KEY` | Groq API key | console.groq.com |
| `DJANGO_SECRET_KEY` | Django secret key | Generate a random string |
| `FIELD_ENCRYPTION_KEY` | Fernet key for token encryption | `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |

## Demo Each Feature (< 2 minutes)

### 1. PR Review
1. Sign in with GitHub → Dashboard → PR Reviewer
2. Enter a repo (e.g., `your-user/your-repo`) and PR number
3. Click "Analyze PR" → Wait for progress bar → See risk score + comments
4. Click "Post to GitHub" to publish the review

### 2. Docs & Changelog
1. Go to Docs & Changelog
2. Enter a repo, select "README" or "Changelog" mode
3. Click "Generate" → See Markdown preview
4. Click "Copy" or "Commit to Repo"

### 3. Bug Triage
1. Go to Bug Triage
2. Enter a repo and issue number
3. Click "Triage Issue" → See severity, labels, likely owner, duplicates
4. Click "Apply labels to GitHub issue"

### 4. Test Generator
1. Go to Test Generator
2. Enter a repo and file path (e.g., `src/utils.py`)
3. Click "Generate Tests" → See generated test code
4. Click "Copy" or "Create File in Repo"

### 5. Repo Health Agent
1. Dashboard → Click "Run Health Check"
2. Enter a repo → Agent autonomously reviews PRs and triages issues
3. See the health summary with PR reviews and issue counts

## Project Structure

```
codesentinel/
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment template
├── RUN.BAT                     # Windows launcher
├── ARCHITECTURE.md             # System architecture doc
├── AGENTS.md                   # Agent rules / constitution
├── AGENTS_AND_SKILLS.md        # Custom agent & skill docs
├── DECISIONS.md                # Design decisions log
├── frontend/                   # React + Vite + Three.js
│   ├── src/pages/              # All 9 pages
│   ├── src/components/         # Layout + landing + shared
│   ├── src/hooks/              # Auth, repos, job status, presence
│   └── src/api/client.js       # Axios API client
├── backend/                    # Django + DRF
│   ├── apps/core/              # Firebase auth + Firestore
│   ├── apps/ai/                # AI fallback chain + skills
│   ├── apps/agents/            # Repo Health Agent
│   ├── apps/github_integration/# GitHub REST API wrapper
│   ├── apps/pr_review/         # PR analysis feature
│   ├── apps/docs_generator/    # Docs/changelog feature
│   ├── apps/bug_triage/        # Issue triage feature
│   └── apps/test_scaffolding/  # Test generation feature
├── infra/                      # Firebase security rules
└── .github/workflows/ci.yml    # CI/CD pipeline
```

## License

MIT
