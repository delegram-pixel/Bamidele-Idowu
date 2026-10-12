/**
 * Shared domain types.
 *
 * These mirror the models defined in `backend-schema.md`. The portfolio is
 * content-driven: all copy lives in typed data files under `src/data`, so a new
 * project means adding data and assets, never restructuring a page
 * (PRD FR-15, TRD section 5).
 */

/**
 * Publication state of a project. Only `live`, `pre-launch`, and `prototype`
 * describe something a visitor could look at; the rest must be labelled.
 */
export type ProjectStatus =
  | "live"
  | "pre-launch"
  | "prototype"
  | "in-progress"
  | "archived";

/**
 * One image in a project gallery.
 *
 * Alt text is part of the image rather than a parallel array, because a gallery
 * is a list of captioned artefacts and splitting the two is how they drift. It
 * is required, not optional: a gallery image without alt text is unreadable to
 * anyone using a screen reader, and these are screenshots — the one kind of
 * image that is never decorative.
 */
export interface ProjectImage {
  /** Path to a genuine, approved screenshot under `/public`. */
  src: string;
  /** What the screenshot shows. Required. */
  alt: string;
}

export interface Project {
  slug: string;
  title: string;
  /** One-line summary for cards and metadata. */
  summary: string;
  /** Longer introductory paragraph for the case-study header. */
  description: string;
  /** Bamidele's actual role. Must be confirmed, never assumed. */
  role: string;
  stack: string[];
  status: ProjectStatus;
  /**
   * Path to a genuine, approved screenshot. Optional on purpose: when absent
   * the case study renders generated fallback art instead of a broken image
   * (app-flow section 13). Do not substitute an invented screenshot.
   */
  coverImage?: string;
  /** Descriptive alt text for `coverImage`. Required when it is set. */
  coverImageAlt?: string;
  /**
   * Additional genuine screenshots, shown on the case study below the narrative.
   *
   * The cover above is the single hero shot; this is everything that needs more
   * than one image to show — a second flow, a different state, a mobile view.
   * Optional, and an empty or absent list simply renders no gallery.
   */
  gallery?: ProjectImage[];
  /** Case-study narrative. Each field is optional so unfinished stories stay unfinished. */
  problem?: string;
  approach?: string;
  implementation?: string;
  outcome?: string;
  nextSteps?: string;
  liveUrl?: string;
  repositoryUrl?: string;
  /** Eligible to appear in the Selected Work section. */
  featured: boolean;
  /** Eligible to appear on any public route at all. */
  published: boolean;
}

export interface Service {
  slug: string;
  title: string;
  summary: string;
  /** Who the service is for, in the client's own terms. */
  idealFor: string;
  deliverables: string[];
  /** What the client ends up with. */
  outcome: string;
  /** Pre-selects the matching option in the contact form's project type field. */
  contactProjectType: ContactProjectType;
  pricingLabel?: string;
  featured: boolean;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

/**
 * Availability is maintained content, not a live signal. `lastReviewed` exists
 * so the content validator can refuse to ship a stale claim (TRD section 8).
 */
export interface Availability {
  status: "available" | "limited" | "unavailable";
  label: string;
  detail: string;
  /** ISO date (YYYY-MM-DD) the status was last confirmed by Bamidele. */
  lastReviewed: string;
}

export interface SiteConfig {
  name: string;
  headline: string;
  description: string;
  locationLabel: string;
  /** IANA time zone for the local clock. */
  timeZone: string;
  availability: Availability;
  contactEmail: string;
  whatsappUrl?: string;
  bookingUrl?: string;
  socialLinks: SocialLink[];
}

/**
 * Pricing is deliberately gated. The spec forbids publishing invented prices,
 * so numeric amounts only appear when `visible` is true and `amount` is set.
 */
export interface PricingItem {
  serviceSlug: string;
  label: string;
  amount?: number;
  currency?: string;
  description: string;
  visible: boolean;
}

export interface PricingFallback {
  heading: string;
  explanation: string;
  /** What actually drives the quote, so the explanation is concrete. */
  factors: string[];
}

export const PROJECT_TYPES = [
  "mvp-web-app",
  "business-website",
  "javascript-training",
  "code-review",
  "something-else",
] as const;

export type ContactProjectType = (typeof PROJECT_TYPES)[number];

export const BUDGET_RANGES = [
  "under-1k",
  "1k-3k",
  "3k-7k",
  "7k-plus",
  "not-sure",
] as const;

export type BudgetRange = (typeof BUDGET_RANGES)[number];

/** Payload accepted by `POST /api/contact` (backend-schema section 4). */
export interface ContactRequest {
  name: string;
  email: string;
  projectType: ContactProjectType;
  budgetRange: BudgetRange;
  message: string;
  /** Honeypot: must be empty. Bots fill it in; humans never see it. */
  company?: string;
}

export type ContactErrorCode =
  | "invalid_input"
  | "rate_limited"
  | "delivery_failed"
  | "server_error";

export interface ContactSuccessResponse {
  ok: true;
  message: string;
}

export interface ContactErrorResponse {
  ok: false;
  code: ContactErrorCode;
  message: string;
  /** Field-level messages, keyed by field name. Never contains provider detail. */
  fieldErrors?: Partial<Record<keyof ContactRequest, string>>;
}

export type ContactResponse = ContactSuccessResponse | ContactErrorResponse;

export interface NavItem {
  label: string;
  /** In-page anchor on the homepage. */
  href: string;
}
