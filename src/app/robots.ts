import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/data/site-config";

/**
 * robots.txt (TRD section 11).
 *
 * Allows everything public. The API route is disallowed so crawlers do not
 * attempt to index a POST-only endpoint, and Next.js internals are excluded
 * because they are build artefacts rather than content.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
