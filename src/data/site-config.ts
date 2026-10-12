import type { SiteConfig } from "@/types";

/**
 * Site-wide configuration.
 *
 * ---------------------------------------------------------------------------
 * BEFORE LAUNCH — replace every `TODO:` value below. `yarn validate:content`
 * fails the build while any remain (see scripts/validate-content.ts).
 * ---------------------------------------------------------------------------
 */
export const siteConfig: SiteConfig = {
  name: "Bamidele Idowu",
  headline: "I build web products people actually use.",
  description:
    "Bamidele Idowu — remote web developer and instructor. I build MVPs, business websites, and digital products, and help teams learn along the way.",

  locationLabel: "Port Harcourt, Nigeria",
  // Used by the local-time display (TRD section 8).
  timeZone: "Africa/Lagos",

  availability: {
    status: "available",
    label: "Available for new work",
    detail: "Currently taking on projects starting in the next few weeks.",
    // Re-confirm this date whenever the status changes. The content validator
    // fails if it goes stale, so the site can never claim availability that
    // nobody has checked (TRD section 8).
    lastReviewed: "TODO: YYYY-MM-DD — confirm availability with Bamidele",
  },

  contactEmail: "TODO: real contact email address",
  // Optional. Leave undefined to hide the WhatsApp link everywhere.
  whatsappUrl: undefined,
  // Optional. Leave undefined to hide the booking link everywhere.
  bookingUrl: undefined,

  socialLinks: [
    // TODO: verify every URL resolves before launch, then uncomment.
    // { label: "GitHub", url: "https://github.com/..." },
    // { label: "LinkedIn", url: "https://linkedin.com/in/..." },
    // { label: "X", url: "https://x.com/..." },
  ],
};

/** Absolute site origin, used for canonical URLs, sitemap, and OG images. */
export function getSiteUrl(): string {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) return "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
