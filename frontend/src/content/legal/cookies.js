import LEGAL_CONFIG from './config';

const C = LEGAL_CONFIG;

export const cookiesContent = {
  title: 'Cookie Policy',
  lastUpdated: C.cookiesLastUpdated,
  sections: [
    {
      id: 'overview',
      title: '1. What Are Cookies',
      body: `Cookies and similar storage mechanisms (localStorage, sessionStorage) are small pieces of data stored on your device. CodeSentinel uses them to authenticate you, remember your preferences, and operate the service.`,
    },
    {
      id: 'cookie-table',
      title: '2. Cookies & Storage Items We Use',
      body: `The following table lists every cookie and browser storage item used by CodeSentinel:

| Name / Key | Provider | Purpose | Type | Duration |
|------------|----------|---------|------|----------|
| Firebase Auth tokens (IndexedDB: \`firebaseLocalStorageDb\`) | Firebase | Stores authentication session, ID tokens, and refresh tokens | Essential | Until sign-out |
| \`${C.consentStorageKey}\` | CodeSentinel | Stores your cookie consent preferences (accepted categories, timestamp, policy version) | Essential | 365 days |
| \`${C.consentRecordsKey}\` | CodeSentinel | Local audit log of consent changes | Essential | 365 days |
| Firebase RTDB WebSocket | Firebase | Maintains real-time connection for job progress updates and presence indicators | Functional | Session only |
| \`firebase:host:*\` | Firebase | Firebase Realtime Database connection metadata | Functional | Session only |

**Note:** CodeSentinel does not use any analytics cookies, advertising cookies, or third-party tracking cookies.`,
    },
    {
      id: 'consent-categories',
      title: '3. Consent Categories',
      body: `We organise cookies into the following categories:

- **Essential** (always active) — Required for authentication, security, and storing your consent preferences. Cannot be disabled.
- **Functional** — Enable features like real-time job progress updates and user presence indicators. Can be disabled, but some features will not work.
- **Analytics** — Currently not used. If we add analytics in the future, they will only load after you grant consent.`,
    },
    {
      id: 'managing-consent',
      title: '4. Managing Your Consent',
      body: `**In-app:** Click the "Cookie settings" link in the footer of any page to open the consent preferences panel. You can change your choices at any time.

**Browser settings:** You can also manage cookies through your browser:

- **Chrome:** Settings → Privacy and security → Cookies and other site data
- **Firefox:** Settings → Privacy & Security → Cookies and Site Data
- **Safari:** Preferences → Privacy → Manage Website Data
- **Edge:** Settings → Cookies and site permissions → Manage and delete cookies

**Clearing storage:** To remove all CodeSentinel data from your browser, clear site data for this domain in your browser's settings. Note that this will sign you out.`,
    },
    {
      id: 'consent-records',
      title: '5. Consent Records',
      body: `When you accept, reject, or modify cookie preferences, we store a record containing:

- Your consent choices (which categories you accepted/rejected)
- The timestamp of your choice
- The policy version at the time of consent

For authenticated users, this record is also saved to your Firestore user profile for compliance purposes. We may re-prompt you for consent if the policy version changes.`,
    },
    {
      id: 'changes',
      title: '6. Changes to This Policy',
      body: `We may update this Cookie Policy when we add or remove cookies/storage items. Changes will be reflected in the "Last updated" date and the policy version in our consent banner.`,
    },
    {
      id: 'contact',
      title: '7. Contact',
      body: `For questions about cookies, contact us at **${C.contactEmail}**.`,
    },
  ],
};

export default cookiesContent;
