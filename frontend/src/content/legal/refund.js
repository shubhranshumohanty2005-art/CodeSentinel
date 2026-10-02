import LEGAL_CONFIG from './config';

const C = LEGAL_CONFIG;

export const refundContent = {
  title: 'Refund Policy',
  lastUpdated: C.refundLastUpdated,
  sections: [
    {
      id: 'current-pricing',
      title: '1. Current Pricing',
      body: `**CodeSentinel is currently free to use.** All five tools — PR Review, Docs & Changelog Generator, Bug Triage, Test Scaffold, and Repo Health Agent — are available at no cost during this period. No payment information is collected.`,
    },
    {
      id: 'future-plans',
      title: '2. If Paid Plans Are Introduced',
      body: `If we introduce paid plans in the future, the following refund policy will apply:

**Eligibility window:** You may request a refund within 14 days of your initial purchase or plan upgrade, provided you have not exceeded fair-use limits during that period.

**How to request:** Send a refund request to **${C.contactEmail}** with your account email and the reason for the refund.

**Processing time:** Refund requests will be reviewed and processed within 7–10 business days. Approved refunds will be credited to the original payment method.

**Non-refundable cases:**
- Requests made after the 14-day eligibility window.
- Accounts suspended or terminated due to Terms of Service violations.
- Partial-month usage after the eligibility window.
- Any promotional or discounted plans explicitly marked as non-refundable at purchase.`,
    },
    {
      id: 'free-tier',
      title: '3. Free Tier Guarantee',
      body: `If paid plans are introduced, we intend to maintain a free tier with basic access to all five core tools, subject to rate limits. Existing free users will not lose access to features they currently use without prior notice.`,
    },
    {
      id: 'changes',
      title: '4. Changes to This Policy',
      body: `We will notify users at least 30 days in advance of any changes to pricing or this refund policy via email and in-app notification.`,
    },
    {
      id: 'contact',
      title: '5. Contact',
      body: `For refund inquiries, contact us at **${C.contactEmail}**.`,
    },
  ],
};

export default refundContent;
