import LEGAL_CONFIG from './config';

const C = LEGAL_CONFIG;

export const privacyContent = {
  title: 'Privacy Policy',
  lastUpdated: C.privacyLastUpdated,
  sections: [
    {
      id: 'overview',
      title: '1. Overview',
      body: `CodeSentinel ("we", "us", "our") is an AI-powered code review and DevOps co-pilot. This Privacy Policy explains what personal data we collect, how we use it, and your rights regarding that data. By using CodeSentinel you agree to this policy.`,
    },
    {
      id: 'data-collected',
      title: '2. Data We Collect',
      body: `We collect the following categories of data:

**Account information** — Your name, email address, profile picture, and unique user ID via Firebase Authentication and GitHub OAuth.

**GitHub profile & repository metadata** — Your GitHub username, repository names, descriptions, branch names, and collaborator lists (read-only access via the \`repo\` and \`read:user\` OAuth scopes).

**Code content sent for analysis** — Pull request diffs, code snippets, file contents, commit messages, and issue descriptions that you submit to our five tools (PR Review, Docs & Changelog Generator, Bug Triage, Test Generator, and Repo Health Agent).

**Usage logs** — Timestamps of tool invocations, which AI provider served each request, and error logs.

**Device and browser information** — IP address, browser type and version, operating system, and referral URLs collected automatically via standard HTTP headers.`,
    },
    {
      id: 'how-data-used',
      title: '3. How We Use Your Data',
      body: `We use the data we collect to:

- **Run the five CodeSentinel tools** — PR Review, Docs & Changelog Generation, Bug Triage, Test Scaffolding, and Repo Health analysis.
- **Improve the service** — Aggregate, anonymised usage statistics help us identify performance bottlenecks and prioritise features.
- **Security and abuse prevention** — We log access patterns to detect and block malicious activity.
- **Communicate with you** — Service announcements, security alerts, and (only with your opt-in consent) product updates.`,
    },
    {
      id: 'github-oauth',
      title: '4. GitHub OAuth',
      body: `**Scopes requested:**
- \`repo\` — Read access to your repositories, pull requests, issues, and commit history so that CodeSentinel can analyse PRs, generate docs, triage bugs, and scaffold tests.
- \`read:user\` — Read your GitHub profile information (username, avatar) for display in the app.

**Token storage:** Your GitHub access token is encrypted using Fernet symmetric encryption (AES-128-CBC) and stored in Google Cloud Firestore. The encryption key is held in a server-side environment variable and is never exposed to the frontend.

**Revoking access:** You can revoke CodeSentinel's access to your GitHub account at any time by visiting [GitHub → Settings → Applications](${C.githubOAuthSettingsUrl}) and removing CodeSentinel. You can also disconnect your GitHub account from within CodeSentinel on the Data & Privacy page.`,
    },
    {
      id: 'third-parties',
      title: '5. Sharing With Third Parties',
      body: `We share data with the following third-party services exclusively to operate CodeSentinel. **We do not sell your data.**

| Service | Data Shared | Purpose | Privacy Policy |
|---------|-------------|---------|----------------|
| Firebase / Google Cloud | Account info, encrypted tokens, analysis results | Authentication, data storage | [Link](${C.firebasePrivacyUrl}) |
| GitHub API | OAuth token, repo metadata, PRs, issues | Source code access | [Link](${C.githubPrivacyUrl}) |
| NVIDIA NIM | Code snippets, PR diffs (primary AI provider) | AI-powered analysis | [Link](${C.nvidiaPrivacyUrl}) |
| Google Gemini | Code snippets, PR diffs (fallback #1) | AI-powered analysis | [Link](${C.googlePrivacyUrl}) |
| Groq | Code snippets, PR diffs (fallback #2) | AI-powered analysis | [Link](${C.groqPrivacyUrl}) |

**Important:** When you use any CodeSentinel tool, the relevant code content (PR diffs, file snippets, issue descriptions) is sent to one of the AI providers listed above for processing. The AI provider chain is NVIDIA NIM → Gemini → Groq; only one provider processes each request.`,
    },
    {
      id: 'storage-retention',
      title: '6. Storage & Retention',
      body: `**Where data is stored:** All durable data is stored in Google Cloud Firestore. Real-time job progress is temporarily held in Firebase Realtime Database and cleared once the Firestore write succeeds.

**Retention periods:**
- Account profile data: retained while your account is active, deleted within ${C.deletionResponseDays} days of an account deletion request.
- PR reviews, docs, triage results, and test scaffolds: retained for ${C.reviewRetentionDays} days, then automatically purged.
- Server logs: retained for ${C.logsRetentionDays} days.

**Backups:** Firestore data is backed up via Google Cloud's automatic replication. We do not maintain separate long-term backup archives of user-generated content.`,
    },
    {
      id: 'user-rights',
      title: '7. Your Rights',
      body: `You have the right to:

- **Access** your data — use the "Download my data" button on the Data & Privacy page.
- **Correct** inaccurate data — update your GitHub profile; changes propagate automatically.
- **Delete** your data — use the "Delete my account and data" button, or email ${C.contactEmail}. We will process deletion within ${C.deletionResponseDays} days.
- **Export** your data — the download feature provides a JSON export of all your stored data.
- **Withdraw consent** — you can withdraw cookie consent at any time via the "Cookie settings" link in the footer, and revoke GitHub access as described in Section 4.

To exercise any right, email ${C.contactEmail} or use the in-app controls on the Data & Privacy page.`,
    },
    {
      id: 'children',
      title: '8. Children\'s Data',
      body: `CodeSentinel is not directed at children under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact ${C.contactEmail} and we will delete it promptly.`,
    },
    {
      id: 'international-transfers',
      title: '9. International Transfers',
      body: `Your data may be processed in data centres operated by Google Cloud (Firebase) and our AI providers, which may be located outside your country of residence. By using CodeSentinel you consent to these transfers. We rely on the provider's standard contractual clauses and security certifications to safeguard your data.`,
    },
    {
      id: 'security',
      title: '10. Security Measures',
      body: `We implement the following security measures:

- All data in transit is encrypted via HTTPS/TLS.
- GitHub tokens are encrypted at rest using Fernet (AES-128-CBC).
- Firebase ID tokens are verified on every API request via server-side middleware.
- API keys are stored in server-side environment variables and never exposed in the frontend bundle.
- Content-Security-Policy headers restrict script execution sources.`,
    },
    {
      id: 'changes',
      title: '11. Policy Changes',
      body: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page and increment the policy version. If the changes are material, we will notify you via an in-app banner and re-prompt for consent where required.`,
    },
    {
      id: 'contact',
      title: '12. Contact',
      body: `For privacy-related questions or requests, contact us at **${C.contactEmail}**.

${C.companyLegalName}
${C.companyAddress}`,
    },
  ],
};

export default privacyContent;
