import type { Project } from "@/types";

/**
 * Project content.
 *
 * ---------------------------------------------------------------------------
 * ACCURACY RULES (PRD section 8 — these are hard requirements, not style notes)
 *
 *  - Only `published: true` projects appear on any public route.
 *  - `featured: true` additionally places a project in Selected Work.
 *  - Do not fill optional narrative fields with invented outcomes, metrics,
 *    testimonials, or user counts. Leaving a field out is correct and the
 *    case study simply omits that block.
 *  - `coverImage` points at a genuine, approved screenshot. While it is absent
 *    the case study renders generated fallback art, which is intentional.
 *  - Every `TODO:` fails `yarn validate:content`, so nothing unconfirmed can
 *    reach a production build.
 * ---------------------------------------------------------------------------
 */
export const projects: Project[] = [
  {
    slug: "admission-copilot",
    title: "Admission Copilot",
    summary:
      "A guided assistant that helps applicants work through admission requirements without losing track of what is still outstanding.",
    description:
      "Admission Copilot turns a scattered admission process into a sequence of clear, checkable steps. Applicants see what is required, what they have completed, and what is blocking them next.",
    role: "TODO: confirm exact role (e.g. sole developer, frontend lead)",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    // Must be labelled accurately as pre-launch (PRD section 8).
    status: "pre-launch",
    problem:
      "Admission requirements are spread across PDFs, emails, and portal messages. Applicants lose track of deadlines and documents, and only discover a missing item when it is too late to fix it comfortably.",
    approach:
      "Model the admission process as an explicit, ordered set of requirements rather than a document to read. Each requirement carries its own state, so progress is always visible instead of inferred.",
    implementation:
      "Built as a Next.js App Router application with typed requirement data, so the checklist is data-driven and can be updated without touching the UI.",
    outcome:
      "Pre-launch. The product is built and being prepared for its first cohort of applicants.",
    nextSteps:
      "Onboard an initial group of applicants, then review where they get stuck and adjust the requirement model accordingly.",
    // No liveUrl yet — it is pre-launch.
    featured: true,
    published: true,
  },
  {
    slug: "iventverse",
    title: "Iventverse",
    summary:
      "An event platform for creating, publishing, and managing events with ticketing and attendee flows.",
    description:
      "Iventverse handles the event lifecycle end to end: organisers publish an event, attendees discover and register for it, and both sides get a clear view of what happens next.",
    role: "TODO: confirm Bamidele's exact role on Iventverse (PRD section 8)",
    stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    status: "live",
    problem:
      "Event organisers juggle separate tools for publishing an event, collecting registrations, and communicating with attendees. The handoffs between those tools are where details get lost.",
    approach:
      "Keep the organiser's event record as the single source of truth and derive the attendee-facing experience from it, so the two can never disagree.",
    implementation:
      "A Next.js front end over a typed API layer, with the event lifecycle modelled explicitly rather than as loose status strings.",
    outcome: "TODO: confirm current status and any verifiable outcome before publishing",
    nextSteps:
      "TODO: confirm which improvements are planned before describing next steps",
    featured: true,
    published: true,
  },
  {
    slug: "stockschool",
    title: "StockSchool",
    summary:
      "An educational platform for learning how tokenized equities work, using simulated positions only.",
    description:
      "StockSchool teaches the mechanics of tokenized equities in a risk-free setting. Learners work through concepts with simulated positions so they can understand how the instruments behave before risking real money.",
    role: "TODO: confirm exact role",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    status: "live",
    problem:
      "Tokenized equities are difficult to learn about from documentation alone. Reading definitions does not build the intuition that comes from seeing a position respond to market movement.",
    approach:
      "Treat the product as a teaching tool first. Every interaction is framed around the concept it demonstrates, and the simulation is explicitly labelled as a simulation throughout.",
    implementation:
      "A Next.js application with a client-side simulation layer, so learners can experiment freely with no real orders ever leaving the browser.",
    /**
     * PRD section 8 requires this to be described as an educational
     * tokenized-equities project that does not execute real trades.
     */
    outcome:
      "Live as an educational tool. StockSchool does not execute real trades: all positions are simulated for learning purposes only.",
    nextSteps:
      "TODO: confirm planned curriculum or product improvements",
    featured: true,
    published: true,
  },
  {
    slug: "next-horizon-hub",
    title: "Next Horizon Hub",
    summary:
      "A client website project delivered for Next Horizon Hub.",
    description:
      "TODO: confirm the approved public description with the client before enabling this case study.",
    role: "TODO: confirm role",
    stack: ["TODO: confirm stack"],
    status: "live",
    /**
     * Held back deliberately. PRD section 8 and app-flow section 12 require
     * written client permission before this becomes a public case study.
     * Flipping `published` to true is the only change needed once that is
     * confirmed — the route and layout already exist.
     */
    featured: true,
    published: false,
  },
];

/** Projects safe to render publicly, newest-first ordering defined by the array. */
export function getPublishedProjects(): Project[] {
  return projects.filter((project) => project.published);
}

/** Projects eligible for the Selected Work section. */
export function getFeaturedProjects(): Project[] {
  return getPublishedProjects().filter((project) => project.featured);
}

/** Look up a single published project. Returns undefined for unknown or unpublished slugs. */
export function getProjectBySlug(slug: string): Project | undefined {
  return getPublishedProjects().find((project) => project.slug === slug);
}
