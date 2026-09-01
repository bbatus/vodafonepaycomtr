export interface NavLink {
  label: string;
  href: string;
  /** RFP §3.2.2 — optional per-link override, only consumed by the mobile nav drawer (HeaderClient.tsx). Undefined means mobile uses `href`, same as desktop. */
  mobileHref?: string;
}

export interface StepProduct {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  /** CMS-editable CTA label under the step (e.g. "Keşfet"). Only shown when ctaHref is also set. */
  ctaLabel?: string;
  /** Resolved from the CMS's `ctaPage` relationship (an active/published Page only) — never a free-text URL. */
  ctaHref?: string;
  /** Optional decorative image behind the text — must render BEHIND the copy (lower z-index), never over it. */
  backgroundImage?: { url: string; alt: string };
}

export interface CampaignCard {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  /** CMS-editable CTA text (campaign.ctaLabel) — falls back to "Detayları gör" when unset. */
  linkLabel?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  /** CMS-editable related link (faqItem.deeplink), shown below the answer when set. */
  deeplink?: string | null;
}
