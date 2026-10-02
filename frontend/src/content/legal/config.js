/**
 * Legal configuration — single source of truth for policy versions,
 * last-updated dates, and contact details used across all legal pages,
 * consent banners, and compliance logic.
 */

export const LEGAL_CONFIG = {
  // ── Policy versions (bump these to re-prompt consent) ──────────
  policyVersion: '1.0.0',
  privacyLastUpdated: '2026-10-02',
  termsLastUpdated: '2026-10-02',
  cookiesLastUpdated: '2026-10-02',
  refundLastUpdated: '2026-10-02',
  dataLastUpdated: '2026-10-02',

  // ── Contact ────────────────────────────────────────────────────
  contactEmail: '[PLACEHOLDER_CONTACT_EMAIL]',
  companyName: 'CodeSentinel',
  companyLegalName: '[PLACEHOLDER_LEGAL_ENTITY_NAME]',
  companyAddress: '[PLACEHOLDER_REGISTERED_ADDRESS]',
  jurisdiction: 'India',
  governingLaw: 'Laws of India',
  disputeResolution: 'Arbitration under the Arbitration and Conciliation Act, 1996, seated in [PLACEHOLDER_CITY], India',

  // ── Data retention ─────────────────────────────────────────────
  accountRetentionDays: 365,
  reviewRetentionDays: 90,
  logsRetentionDays: 30,
  deletionResponseDays: 30,

  // ── LocalStorage keys (documented in Cookie Policy) ────────────
  consentStorageKey: 'cs_consent',
  consentRecordsKey: 'cs_consent_records',

  // ── External links ─────────────────────────────────────────────
  githubOAuthSettingsUrl: 'https://github.com/settings/connections/applications',
  firebasePrivacyUrl: 'https://firebase.google.com/support/privacy',
  googlePrivacyUrl: 'https://policies.google.com/privacy',
  nvidiaPrivacyUrl: 'https://www.nvidia.com/en-us/about-nvidia/privacy-policy/',
  groqPrivacyUrl: 'https://groq.com/privacy-policy/',
  groqTermsUrl: 'https://groq.com/terms-of-use/',
  githubPrivacyUrl: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
  googleFontsPrivacyUrl: 'https://developers.google.com/fonts/faq/privacy',
};

export default LEGAL_CONFIG;
