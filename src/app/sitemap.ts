import type { MetadataRoute } from "next";

import { getPublishedProjects } from "@/data/projects";
import { getSiteUrl } from "@/data/site-config";

/**
 * Sitemap (TRD section 11).
 *
 * Lists the homepage, the contact page, and every published case study.
 * Unpublished projects are absent by construction — `getPublishedProjects` is
 * the same accessor the routes use, so a sitemap entry cannot describe a page
 * that does not exist.
 *
 * `lastModified` is omitted rather than set to the build time. A sitemap that
 * claims every page changed on every deploy teaches crawlers to distrust the
 * signal, which is worse than providing none.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  const caseStudies: MetadataRoute.Sitemap = getPublishedProjects().map((project) => ({
    url: `${siteUrl}/work/${project.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    ...caseStudies,
  ];
}
