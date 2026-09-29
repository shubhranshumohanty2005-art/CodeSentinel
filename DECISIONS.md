# CodeSentinel Decisions Log

## Assumptions & Decisions

### Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| AI primary model (NVIDIA) | `meta/llama-3.1-70b-instruct` | Best available reasoning model on NVIDIA NIM for code tasks |
| AI fallback 1 (Gemini) | `gemini-1.5-flash` | Fast, reliable, good at planning/summarization |
| AI fallback 2 (Groq) | `llama-3.1-70b-versatile` | Ultra-fast inference as last resort |
| Accent color | Electric blue `#00D4FF` | High contrast on dark navy, matches tech/code aesthetic |
| Duplicate detection | Keyword/Jaccard similarity | Simple but effective for hackathon; documented where embedding search would go |
| GitHub token encryption | Fernet symmetric encryption | Industry standard; key from `FIELD_ENCRYPTION_KEY` env var |
| Redis cache TTL | 60 seconds | Balances freshness vs. rate limit protection |
| RTDB cleanup | Backend deletes job_status after Firestore write | Ensures RTDB stays ephemeral per spec |

### Tool Substitutions

| Specified | Used | Reason |
|---|---|---|
| Antigravity SDK task/agent-manager APIs | Standard Antigravity IDE tools (file creation, terminal commands) | Task/agent-manager APIs not directly available; used IDE's native capabilities instead |
| Antigravity SDK browser-preview | Manual verification via Docker | Browser preview used when available; Docker serves as verification fallback |
| Antigravity SDK terminal execution | Antigravity IDE `run_command` tool | Direct equivalent |

### Authentication Flow

- Firebase Auth GitHub OAuth is used for sign-in (popup flow)
- The GitHub OAuth access token from `GithubAuthProvider.credentialFromResult()` is sent to the backend
- Backend encrypts the token with Fernet and stores in Firestore
- All subsequent GitHub API calls use this stored token
- Firebase ID token is used for API authentication (Bearer header)
- **Note**: The Firebase Admin SDK service account JSON must be downloaded from Firebase Console and placed at `backend/firebase-service-account.json` (or the path specified by `FIREBASE_ADMIN_SDK_JSON_PATH`)

### Database Design

- Firestore is the system of record for all durable data
- Realtime Database is used ONLY for ephemeral live-UI data (job progress, presence)
- RTDB nodes are cleaned up after job completion — never holds durable copies
- Firestore security rules allow authenticated users to access repo data (simplified for hackathon; production would cross-reference repo connections)

### Frontend Design

- Glassmorphism throughout: `backdrop-blur-xl`, `bg-white/5`, `border border-white/10`
- Dark theme with navy background (`#0B0E1A` to `#12162B`)
- Electric blue accent (`#00D4FF`) for CTAs, active states, gauges
- Three.js hero uses a particle network mesh with floating torus rings
- Framer Motion for page transitions and card hover effects
- Responsive mobile nav via animated drawer

### Security Considerations

- API keys are NEVER hardcoded — all read from environment variables
- `.env` file is in `.gitignore`
- GitHub tokens encrypted at rest in Firestore
- Firebase ID tokens verified on every backend request
- **WARNING**: The `.env.example` file contains the user's actual API keys for convenience during the hackathon. In production, these should be replaced with placeholders.

### CI/CD

- GitHub Actions workflow runs on push/PR to `main`
- Uses dummy env vars for CI so no real credentials needed
- Three jobs: backend (Django check + tests), frontend (npm build), Docker (compose build)
- Redis service container provided for backend tests

### Known Limitations

1. Duplicate detection uses simple Jaccard similarity — a production system would use embedding-based semantic search
2. The Repo Health Agent processes up to 5 PRs and 10 issues per run to stay within rate limits
3. Diff chunking uses character count, not token count — may occasionally exceed token limits for very dense code
4. Firebase Admin SDK requires a service account JSON file that must be manually downloaded from Firebase Console
5. FIELD_ENCRYPTION_KEY must be a valid Fernet key — if empty, tokens are stored in plaintext (dev mode only)
