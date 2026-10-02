import axios from 'axios';
import { getIdToken } from '../firebase';

// Hardcoded for Vercel production to prevent Vercel env var overrides
const API_BASE = import.meta.env.DEV 
  ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api')
  : 'https://codesentinel-backend-nk87.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase ID token to every request
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn('Failed to get auth token:', e);
  }
  return config;
});

// Response error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error ||
                    error.response?.data?.message ||
                    error.message ||
                    'An unexpected error occurred';
    console.error('API Error:', message);
    return Promise.reject({ message, status: error.response?.status });
  }
);

// ── Auth ──────────────────────────────────────────────
export function createSession(firebaseToken, githubToken, githubLogin) {
  return apiClient.post('/auth/session/', {
    firebase_token: firebaseToken,
    github_token: githubToken,
    github_login: githubLogin,
  });
}

export function getCurrentUser() {
  return apiClient.get('/auth/me/');
}

// ── GitHub ────────────────────────────────────────────
export function listRepos() {
  return apiClient.get('/github/repos/');
}

export function connectRepo(repoId, fullName) {
  return apiClient.post('/github/repos/connect/', { repo_id: repoId, full_name: fullName });
}

export function disconnectRepo(repoId) {
  return apiClient.post('/github/repos/disconnect/', { repo_id: repoId });
}

// ── PR Review ─────────────────────────────────────────
export function analyzePR(repo, prNumber) {
  return apiClient.post('/pr-review/analyze/', { repo, pr_number: prNumber });
}

export function postPRToGithub(repo, prNumber) {
  return apiClient.post('/pr-review/post-to-github/', { repo, pr_number: prNumber });
}

export function getPRReport(repoId, prNumber) {
  return apiClient.get(`/pr-review/report/${repoId}/${prNumber}/`);
}

// ── Docs Generator ────────────────────────────────────
export function generateDocs(repo, mode, baseRef, headRef) {
  return apiClient.post('/docs/generate/', { repo, mode, base_ref: baseRef, head_ref: headRef });
}

export function commitDocs(repo, filePath, content, message) {
  return apiClient.post('/docs/commit/', { repo, file_path: filePath, content, message });
}

// ── Bug Triage ────────────────────────────────────────
export function analyzeIssue(repo, issueNumber) {
  return apiClient.post('/bug-triage/analyze/', { repo, issue_number: issueNumber });
}

export function applyLabels(repo, issueNumber, labels) {
  return apiClient.post('/bug-triage/apply-labels/', { repo, issue_number: issueNumber, labels });
}

// ── Test Scaffolding ──────────────────────────────────
export function generateTests(repo, filePath, functionName) {
  return apiClient.post('/test-scaffolding/generate/', {
    repo, file_path: filePath, function_name: functionName,
  });
}

export function commitTest(repo, testPath, content, message) {
  return apiClient.post('/test-scaffolding/commit/', {
    repo, test_path: testPath, content, message,
  });
}

// ── Agents ────────────────────────────────────────────
export function runHealthAgent(repo) {
  return apiClient.post('/agents/repo-health/run/', { repo });
}

export function getHealthReport(repoId) {
  return apiClient.get(`/agents/repo-health/report/${repoId}/`);
}

// ── Data Management ───────────────────────────────────
export function downloadMyData() {
  return apiClient.get('/auth/data/download/');
}

export function deleteMyAccount() {
  return apiClient.delete('/auth/data/delete/');
}

export function disconnectGitHub() {
  return apiClient.post('/auth/data/disconnect-github/');
}

export function saveConsentRecord(consentData) {
  return apiClient.post('/auth/data/consent/', consentData);
}

export default apiClient;
