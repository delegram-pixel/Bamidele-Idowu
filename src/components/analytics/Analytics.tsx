import Script from "next/script";

import { getAnalyticsConfig } from "@/lib/analytics/events";

/**
 * Privacy-friendly analytics loader (TRD section 10).
 *
 * Loads a single lightweight script when configured and renders nothing when it
 * is not — so the site is fully functional with analytics absent, which
 * app-flow section 13 requires.
 *
 * The provider is Plausible-compatible: cookieless, no personal data, and no
 * cross-site tracking, so no consent banner is required under GDPR or the NDPR.
 * Custom events are sent from `lib/analytics/track.ts` and carry no visitor
 * input (see the payload contract in `lib/analytics/events.ts`).
 */
export function Analytics() {
  const config = getAnalyticsConfig();
  if (!config) return null;

  return (
    <Script
      defer
      data-domain={config.domain}
      src={`${config.src}/js/script.js`}
      strategy="afterInteractive"
    />
  );
}
