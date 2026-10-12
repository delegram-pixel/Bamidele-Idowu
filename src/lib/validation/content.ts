import { pricingItems } from "@/data/pricing";
import { processSteps } from "@/data/process";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { siteConfig } from "@/data/site-config";
import { findPlaceholders } from "@/lib/utils/placeholder";
import { isSafeExternalUrl } from "@/lib/utils/url";
import {
  PROJECT_TYPES,
  type PricingItem,
  type ProcessStep,
  type Project,
  type ProjectStatus,
  type Service,
  type SiteConfig,
} from "@/types";

/**
 * Content validation.
 *
 * Runs two ways:
 *   - `yarn validate:content`, wired to `prebuild`, so bad content fails the build
 *   - as a unit test, so the rules are regression-tested
 *
 * This is what enforces the spec's accuracy requirements mechanically instead of
 * relying on someone remembering them (backend-schema section 9).
 */

export interface ContentIssue {
  /** Dotted path to the offending value, e.g. `projects[1].role`. */
  path: string;
  message: string;
  severity: "error" | "warning";
}

/**
 * The content the rules run against.
 *
 * Injectable so each rule can be exercised against a fixture. Production always
 * uses the real data modules, which are the default.
 */
export interface ContentSources {
  siteConfig: SiteConfig;
  projects: Project[];
  services: Service[];
  processSteps: ProcessStep[];
  pricingItems: PricingItem[];
}

const liveSources: ContentSources = {
  siteConfig,
  projects,
  services,
  processSteps,
  pricingItems,
};


const VALID_STATUSES: ProjectStatus[] = [
  "live",
  "pre-launch",
  "prototype",
  "in-progress",
  "archived",
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Availability claims go stale. After this many days the status must be re-confirmed. */
const AVAILABILITY_MAX_AGE_DAYS = 60;

export function validateContent(
  now: Date = new Date(),
  sources: ContentSources = liveSources,
): ContentIssue[] {
  const issues: ContentIssue[] = [];

  const add = (path: string, message: string, severity: ContentIssue["severity"] = "error") => {
    issues.push({ path, message, severity });
  };

  // --- Placeholders --------------------------------------------------------
  // Any unresolved `TODO:` means the content is not ready to publish.
  for (const path of findPlaceholders(sources)) {
    add(path, "Unresolved TODO placeholder — confirm this content before launch.");
  }

  // --- Projects ------------------------------------------------------------
  const seenSlugs = new Set<string>();

  sources.projects.forEach((project, index) => {
    const at = `projects[${index}]`;

    if (!SLUG_PATTERN.test(project.slug)) {
      add(`${at}.slug`, `Slug "${project.slug}" must be lowercase kebab-case.`);
    }

    if (seenSlugs.has(project.slug)) {
      add(`${at}.slug`, `Duplicate project slug "${project.slug}".`);
    }
    seenSlugs.add(project.slug);

    if (!VALID_STATUSES.includes(project.status)) {
      add(`${at}.status`, `Unsupported project status "${project.status}".`);
    }

    if (project.stack.length === 0) {
      add(`${at}.stack`, "At least one technology is required.");
    }

    // A featured project that is not published would silently vanish from the
    // homepage, which is usually a mistake rather than an intent.
    if (project.featured && !project.published) {
      add(
        `${at}.featured`,
        "Project is featured but not published, so it will never be shown.",
        "warning",
      );
    }

    // Missing art is allowed (a fallback is rendered), but alt text must never
    // exist without the image it describes.
    if (project.coverImage && !project.coverImageAlt) {
      add(`${at}.coverImageAlt`, "Alt text is required when a cover image is set.");
    }
    if (!project.coverImage && project.coverImageAlt) {
      add(`${at}.coverImageAlt`, "Alt text set without a cover image.");
    }

    for (const [field, value] of [
      ["liveUrl", project.liveUrl],
      ["repositoryUrl", project.repositoryUrl],
    ] as const) {
      if (value !== undefined && !isSafeExternalUrl(value)) {
        add(`${at}.${field}`, `"${value}" is not a safe absolute http(s) URL.`);
      }
    }

    // Pre-launch means there is nothing to visit yet.
    if (project.status === "pre-launch" && project.liveUrl) {
      add(
        `${at}.liveUrl`,
        "Pre-launch projects must not link to a live URL (PRD section 8).",
      );
    }

    if (project.published && project.summary.trim().length < 40) {
      add(
        `${at}.summary`,
        "Published projects need a summary of at least 40 characters.",
      );
    }
  });

  const published = sources.projects.filter((project) => project.published);
  if (published.length === 0) {
    add("projects", "No published projects — the Selected Work section would be empty.");
  }
  if (published.filter((project) => project.featured).length > 5) {
    add("projects", "More than five featured projects; PRD section 7.3 asks for three to five.");
  }

  // --- Services ------------------------------------------------------------
  const serviceSlugs = new Set<string>();
  sources.services.forEach((service, index) => {
    const at = `services[${index}]`;

    if (serviceSlugs.has(service.slug)) {
      add(`${at}.slug`, `Duplicate service slug "${service.slug}".`);
    }
    serviceSlugs.add(service.slug);

    if (service.deliverables.length === 0) {
      add(`${at}.deliverables`, "At least one deliverable is required.");
    }

    if (!PROJECT_TYPES.includes(service.contactProjectType)) {
      add(
        `${at}.contactProjectType`,
        `"${service.contactProjectType}" is not a known contact form option.`,
      );
    }
  });

  // --- Site configuration --------------------------------------------------
  const { siteConfig: site } = sources;

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(site.contactEmail)) {
    add("siteConfig.contactEmail", "Contact email is not a valid address.");
  }

  if (site.whatsappUrl && !isSafeExternalUrl(site.whatsappUrl)) {
    add("siteConfig.whatsappUrl", "WhatsApp URL must be an absolute http(s) URL.");
  }

  site.socialLinks.forEach((link, index) => {
    if (!isSafeExternalUrl(link.url)) {
      add(`siteConfig.socialLinks[${index}].url`, `"${link.url}" is not a safe URL.`);
    }
  });

  // Clock correctness depends on a valid IANA zone.
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: site.timeZone });
  } catch {
    add("siteConfig.timeZone", `"${site.timeZone}" is not a valid IANA time zone.`);
  }

  // Availability must be re-confirmed, never assumed (TRD section 8).
  const reviewedAt = new Date(site.availability.lastReviewed);
  if (Number.isNaN(reviewedAt.getTime())) {
    add(
      "siteConfig.availability.lastReviewed",
      "Availability review date must be an ISO date (YYYY-MM-DD).",
    );
  } else {
    const ageDays = (now.getTime() - reviewedAt.getTime()) / 86_400_000;
    if (ageDays > AVAILABILITY_MAX_AGE_DAYS) {
      add(
        "siteConfig.availability",
        `Availability was last confirmed ${Math.floor(ageDays)} days ago. Re-confirm it, or the site is claiming a status nobody has checked.`,
      );
    }
  }

  // --- Pricing -------------------------------------------------------------
  const knownServiceSlugs = new Set(sources.services.map((service) => service.slug));
  sources.pricingItems.forEach((item, index) => {
    const at = `pricing[${index}]`;

    if (!knownServiceSlugs.has(item.serviceSlug)) {
      add(`${at}.serviceSlug`, `No service with slug "${item.serviceSlug}".`);
    }

    // The core pricing rule: no visible price without a confirmed amount.
    if (item.visible && item.amount === undefined) {
      add(
        `${at}.amount`,
        "A visible price must have a confirmed amount. Do not publish an invented figure (PRD section 7.6).",
      );
    }
    if (item.visible && !item.currency) {
      add(`${at}.currency`, "A visible price must specify its currency.");
    }
    if (item.amount !== undefined && item.amount <= 0) {
      add(`${at}.amount`, "Amount must be greater than zero.");
    }
  });

  // --- Process -------------------------------------------------------------
  if (sources.processSteps.length !== 4) {
    add(
      "processSteps",
      `Expected 4 process steps, found ${sources.processSteps.length}.`,
      "warning",
    );
  }

  return issues;
}

/** Errors only — the conditions that must block a production build. */
export function getBlockingIssues(issues: ContentIssue[]): ContentIssue[] {
  return issues.filter((issue) => issue.severity === "error");
}
