import LEGAL_CONFIG from './config';

const C = LEGAL_CONFIG;

export const termsContent = {
  title: 'Terms & Conditions',
  lastUpdated: C.termsLastUpdated,
  sections: [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      body: `By creating an account or using CodeSentinel, you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree, do not use the service.`,
    },
    {
      id: 'eligibility',
      title: '2. Eligibility & Account Responsibility',
      body: `You must be at least 16 years old and have a valid GitHub account to use CodeSentinel. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account.`,
    },
    {
      id: 'acceptable-use',
      title: '3. Acceptable Use',
      body: `You agree **not** to:

- Scan, analyse, or access repositories you do not own or do not have explicit permission to access.
- Abuse, spam, or overload the AI tools (PR Review, Docs Generator, Bug Triage, Test Scaffold, Repo Health Agent) with automated or bulk requests beyond fair-use limits.
- Attempt to reverse-engineer, decompile, or extract the models, prompts, or algorithms used by CodeSentinel or its AI providers.
- Use the service to generate malicious code, malware, or content that violates any law.
- Circumvent rate limits, authentication mechanisms, or security controls.
- Share your account credentials or GitHub token with third parties.`,
    },
    {
      id: 'user-content',
      title: '4. User Content & Licence',
      body: `**Ownership:** You retain full ownership of all code, pull requests, issues, and other content you submit to CodeSentinel ("User Content").

**Licence granted to us:** By submitting User Content, you grant CodeSentinel a limited, non-exclusive, non-transferable licence to process, transmit, and temporarily store that content solely for the purpose of running the requested tool (e.g., reviewing a PR, generating docs). We do not use your code to train AI models.

**AI-generated output:** Output produced by CodeSentinel (reviews, docs, tests, triage reports) is provided to you under the same licence terms as your input. You may use, modify, and distribute the output freely, subject to any licences governing the original code.`,
    },
    {
      id: 'ai-disclaimer',
      title: '5. AI Output Disclaimer',
      body: `> **CodeSentinel's AI-generated outputs — including PR reviews, test scaffolds, documentation, changelogs, and bug triage reports — may be incorrect, incomplete, or misleading. You must review and verify all AI output before merging, deploying, or relying on it in any way.**

CodeSentinel is a tool to assist human developers, not replace them. We make no warranties regarding the accuracy, security, or fitness of any AI-generated content. You are solely responsible for the code you ship.`,
    },
    {
      id: 'third-party-services',
      title: '6. Third-Party Services',
      body: `CodeSentinel integrates with third-party services including GitHub, Firebase/Google Cloud, NVIDIA NIM, Google Gemini, and Groq. Your use of these services is subject to their respective terms:

- [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)
- [Google Cloud / Firebase Terms](https://cloud.google.com/terms)
- [NVIDIA NIM Terms](https://www.nvidia.com/en-us/data-center/products/ai-inference/)
- [Groq Terms of Use](${C.groqTermsUrl})

We are not responsible for the availability, performance, or policies of these third-party services.`,
    },
    {
      id: 'rate-limits',
      title: '7. Rate Limits & Fair Use',
      body: `To ensure fair access for all users, CodeSentinel enforces rate limits on API requests. Exceeding these limits may result in temporary throttling or suspension. Current limits are published in the documentation and may change without notice.`,
    },
    {
      id: 'availability',
      title: '8. Service Availability',
      body: `We strive to maintain high availability but do not guarantee uninterrupted service. Planned maintenance windows will be announced in advance where possible. We are not liable for downtime caused by third-party providers, force majeure, or circumstances beyond our reasonable control.`,
    },
    {
      id: 'suspension',
      title: '9. Suspension & Termination',
      body: `We may suspend or terminate your account at any time if you violate these Terms, engage in abusive behaviour, or if required by law. You may delete your account at any time via the Data & Privacy page. Upon termination, your data will be deleted in accordance with our Privacy Policy.`,
    },
    {
      id: 'liability',
      title: '10. Limitation of Liability',
      body: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, CODESENTINEL AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.

Our total aggregate liability for any claim arising from these Terms shall not exceed the amount you paid us in the twelve (12) months preceding the claim, or ₹5,000 (INR), whichever is greater.`,
    },
    {
      id: 'indemnity',
      title: '11. Indemnity',
      body: `You agree to indemnify and hold harmless CodeSentinel, its operators, and affiliates from any claims, damages, losses, or expenses (including legal fees) arising from your use of the service, your User Content, or your violation of these Terms.`,
    },
    {
      id: 'governing-law',
      title: '12. Governing Law & Jurisdiction',
      body: `These Terms are governed by the ${C.governingLaw}. Any disputes shall be resolved through ${C.disputeResolution}. You consent to the exclusive jurisdiction of the courts in ${C.jurisdiction}.`,
    },
    {
      id: 'changes',
      title: '13. Changes to Terms',
      body: `We may update these Terms from time to time. Material changes will be communicated via an in-app notification. Continued use of CodeSentinel after changes take effect constitutes acceptance of the updated Terms.`,
    },
    {
      id: 'contact',
      title: '14. Contact',
      body: `For questions about these Terms, contact us at **${C.contactEmail}**.

${C.companyLegalName}
${C.companyAddress}`,
    },
  ],
};

export default termsContent;
