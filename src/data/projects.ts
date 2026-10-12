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
 *  - `gallery` holds further genuine screenshots. Files live in `public/` and
 *    are referenced from the site root, e.g. `"/admission-copilot-2.png"` —
 *    the leading slash is required, and the gate rejects a path without it
 *    because it would resolve relative to whatever route rendered it. Every
 *    gallery image needs its own alt text.
 *  - `liveUrl` is the link to the product itself and may be set at any status,
 *    `pre-launch` included: a preview, a prototype, or a testnet build is still
 *    something a visitor can open, and withholding the link until launch helps
 *    nobody. The wording of that link follows the status (see
 *    `ProjectMetadata`), so it never claims a launch that has not happened.
 *    `repositoryUrl` is the same idea for source.
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
    role: "Team Lead",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    // Must be labelled accurately as pre-launch (PRD section 8).
    status: "pre-launch",
    coverImage: "/admission-copilot.png",
    coverImageAlt:
      "Admission Copilot's eligibility page: the headline 'Find out if you qualify, before it's too late.' beside a panel of five O'level results, with a callout that one credit is still outstanding.",
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
    // The product link. Admission Copilot is pre-launch, so this row reads
    // "Preview" rather than "Visit site": the link opens a working build, and
    // nothing on the page claims the product has launched.
    liveUrl: "https://education-ten-wheat.vercel.app",
    // Further screenshots, shown in a gallery below the case-study story.
    // Add the files to `public/` and list them here.
    // gallery: [{ src: "/admission-copilot-2.png", alt: "…" }],
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
    role: "Front-end Developer",
    stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    status: "live",
    coverImage: "/iventverse.png",
    coverImageAlt:
      "Iventverse's Festival listings: two event cards showing artwork, date, venue, and organiser, under tabs for Upcoming, All, and Past.",
    problem:
      "Event organisers juggle separate tools for publishing an event, collecting registrations, and communicating with attendees. The handoffs between those tools are where details get lost.",
    approach:
      "Keep the organiser's event record as the single source of truth and derive the attendee-facing experience from it, so the two can never disagree.",
    implementation:
      "A Next.js front end over a typed API layer, with the event lifecycle modelled explicitly rather than as loose status strings.",
    // outcome: "TODO: confirm current status and any verifiable outcome before publishing",
    // nextSteps:
    //   "TODO: confirm which improvements are planned before describing next steps",
    // The live product.
    liveUrl: "https://iventverse.com",
    // gallery: [{ src: "/iventverse-2.png", alt: "…" }],
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
    role: "Lead Developer",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    status: "live",
    coverImage: "/stock-school.png",
    coverImageAlt:
      "StockSchool's landing page, labelled 'BNB Hack · Tokenized Stocks Edition', with the headline 'A stock is a claim. A token is a record. Together they get strange.' beside a sample panel setting each asset's on-chain price against its reference price.",
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
    // nextSteps:
    //   "TODO: confirm planned curriculum or product improvements",
    // The live product.
    liveUrl: "https://stockschool-mu.vercel.app",
    // gallery: [{ src: "/stock-school-2.png", alt: "…" }],
    featured: true,
    published: true,
  },
  {
    slug: "thermal-basket",
    title: "Thermal Basket",
    summary:
      "A testnet app for publishing a themed basket of tokenized equities as a single on-chain token.",
    description:
      "Thermal Basket publishes a theme as a fixed set of tokenized equities held together on-chain. Depositing the settlement asset returns a basket token that can be redeemed at net asset value, and every weight, fee, and holding is readable from the contract that holds it. The deployment runs on BNB Smart Chain testnet against a mock price feed, so nothing it displays is market data or a quotation.",
    role: "Lead Developer",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    status: "prototype",
    coverImage: "/thermal-basket.png",
    coverImageAlt:
      "Thermal Basket's landing page, headed 'Own a theme, not a ticker.', with a column of protocol figures beside a notice that every price and valuation comes from a simulated mock feed on BNB Smart Chain testnet.",
    // Outbound links. Both must be absolute http(s) URLs, and a link may be set
    // at any status. The row is omitted entirely while one is unset (see
    // ProjectMetadata). This is the BNB Smart Chain testnet deployment, which is
    // why the row reads "Open prototype" rather than "Visit site".
    liveUrl: "https://thermal-basket.vercel.app",
    // gallery: [{ src: "/thermal-basket-2.png", alt: "…" }],
    // repositoryUrl: "https://github.com/delegram-pixel/…",
    featured: true,
    published: true,
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
