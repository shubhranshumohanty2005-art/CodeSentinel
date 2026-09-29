# CodeSentinel — Agent Rules (Constitution)

## Coding Conventions

- Always use Python 3.11+ features in the backend. Type hints encouraged.
- Always use ES2022+ JavaScript in the frontend. Use functional React components with hooks.
- Never use class-based React components.
- Always use `const` or `let`, never `var`.
- Always use template literals for string interpolation.
- Python: follow PEP 8, max line length 120 characters.
- JavaScript: use single quotes for strings, semicolons optional (Vite default).

## Commit Message Format

- Use conventional commits: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`
- Scope: `frontend`, `backend`, `infra`, `docs`, `ai`, `agents`
- Examples:
  - `feat(backend): add PR review endpoint`
  - `fix(frontend): handle empty state in Dashboard`
  - `docs: update ARCHITECTURE.md with new flow`

## Required Checks Before a Task Counts as Done

- `python manage.py check` passes with no errors.
- `python manage.py test` passes — all tests green.
- `npm run build` completes with no errors in the frontend.
- No hardcoded secrets anywhere in the codebase.
- All API keys read from environment variables via `os.getenv()` or `import.meta.env`.
- `docker compose build` succeeds for all three services.

## AI Fallback Chain Contract

- Always use `apps.ai.ai_client.generate()` or `generate_json()` for AI calls.
- Never call a provider directly from views or services.
- The chain order is fixed: NVIDIA NIM → Gemini → Groq.
- Never hardcode an API key. Always read from `settings.NVIDIA_API_KEY`, etc.
- Always store which provider served a request in Firestore (`aiProvider` field).
- Always catch and log provider errors — never let a single provider failure crash the app.

## Scaffolding New Features

### Backend
- Create a new Django app under `backend/apps/<feature_name>/`.
- Include `__init__.py`, `apps.py`, `views.py`, `services.py`, `urls.py`.
- Wire the app's URLs into `codesentinel/urls.py`.
- Add the app to `INSTALLED_APPS` in `settings.py`.
- Business logic goes in `services.py`, not in `views.py`.
- Views are thin: parse request, call service, return response.

### Frontend
- Create a new page under `frontend/src/pages/<PageName>.jsx`.
- Add the API functions to `frontend/src/api/client.js`.
- Wire the route into `frontend/src/App.jsx`.
- Add a nav link in `frontend/src/components/layout/Navbar.jsx`.
- Use `PageShell` for consistent layout and `GlassCard` for content cards.

### AI Features
- Add a prompt template in `backend/apps/ai/prompts/templates.py`.
- Call `ai_client.generate()` or `generate_json()` from the service.
- Record `aiProvider` in all Firestore writes.

## Security Rules

- Never expose GitHub tokens to the frontend — they stay in Firestore, encrypted.
- Never log API keys or tokens.
- Always verify Firebase ID tokens in the backend middleware.
- Never trust client-supplied user IDs — always use `request.user_id` from the middleware.
- Always use HTTPS for external API calls.

## Data Rules

- Firestore is the system of record. All durable data lives there.
- Realtime Database is ephemeral only — for live progress bars and presence.
- Always clear RTDB job_status nodes after the Firestore write succeeds.
- Never store final results in Realtime Database.

## Error Handling

- Always handle errors gracefully in the frontend — show toast messages, never blank screens.
- Always return JSON error responses from the backend, never HTML error pages.
- Always log errors server-side with `logger.error()` or `logger.warning()`.
- Always include a retry mechanism for AI and GitHub API calls.
