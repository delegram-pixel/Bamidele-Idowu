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
    /**
     * Ordered as the journey runs: the hub, then eligibility, then the
     * registration guide, the optional course-fit check, and finally the
     * human hand-off. Each alt text describes what is actually on the screen.
     *
     * The registration guide is captioned as a wireframe because that is what
     * the screen says it is — the page carries the label "Illustrative
     * wireframe — not a screenshot of the real portal", and PRD section 8
     * forbids presenting a mock as the genuine article.
     */
    gallery: [
      {
        src: "/admission-copilot-path.png",
        alt: "Admission Copilot's admissions path page, headed 'Start where you are.', with three numbered steps: check what you qualify for, get walked through registration, and reach a person when you need one.",
      },
      {
        src: "/admission-copilot-school-course.png",
        alt: "The eligibility checker, headed 'Choose your school and course', with University of Lagos selected and Accounting chosen, above a notice advising applicants to confirm deadlines themselves and never share an OTP, PIN, or bank-card detail with a chat agent.",
      },
      {
        src: "/admission-copilot-cbt-centre.png",
        alt: "The registration guide for choosing a CBT centre: a nine-step checklist down the left with the first three steps complete and 'Choose a CBT centre' in progress, beside an illustrative panel on the right labelled 'Illustrative wireframe — not a screenshot of the real portal.'",
      },
      {
        src: "/admission-copilot-course-fit.png",
        alt: "The optional course-fit questionnaire, headed 'Would you actually enjoy it?', showing question 1 of 8 — 'When something at home stops working, I would rather open it up and look inside than wait for someone else to fix it.' — with radio-button answers beneath.",
      },
      {
        src: "/admission-copilot-counselor.png",
        alt: "The ask-a-counselor form, with a topic select and short title both set to 'Something else', above a message field containing a sample question and a request to reply in clear Nigerian English.",
      },
    ],
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
    /**
     * Ordered to follow the product's own navigation — Learn, Explore,
     * Simulate, On-Chain, Progress — with the two Learn sub-screens kept
     * together behind the dashboard they belong to.
     *
     * The cover already shows the landing page, so nothing here repeats it.
     * The Explore and Simulate captures both carry the product's own
     * "You are looking at sample data" banner, which is described rather than
     * cropped away: StockSchool's honesty about what is simulated is the point
     * of the product, not an artifact of the screenshot.
     */
    gallery: [
      {
        src: "/stock-school-learn.png",
        alt: "StockSchool's Learn dashboard, showing 1 of 8 lessons completed above a row of eight numbered lesson chips, with lesson 01 marked Completed, a 'Pick up where you left off' card for lesson 02, The Token.",
      },
      {
        src: "/stock-school-lesson.png",
        alt: "A lesson page: lesson 02, The Token, tagged Beginner and 7 min and marked 'In progress', above a card headed 'By the end of this lesson' that states in plain terms what the learner will be able to explain. A 'On this page' contents rail runs down the right.",
      },
      {
        src: "/stock-school-figure.png",
        alt: "An interactive figure headed 'Where a token actually lives', with Back and Next controls stepping through 4 stages and a checkbox to apply a 2-for-1 split. Four labelled panels — company register, custody account, smart contract, wallet — each hold a quantity of 1, above a stat row reading 1 share on register, 1 token in existence, $100.00 per token, and $100.00 total value.",
      },
      {
        src: "/stock-school-explore.png",
        alt: "The Explore page, headed 'Two prices for the same share, side by side.', explaining that a tokenized stock is quoted once by the exchange and once by the on-chain pool and that the gap between them is the thing worth understanding. A banner states 'You are looking at sample data' because market data is temporarily unavailable, above a stat row: 10 tokenized stocks, 4 above reference, 4 below, widest gap +2.00% on NVDA.",
      },
      {
        src: "/stock-school-simulate.png",
        alt: "The Simulate page, headed 'Your first trade, somewhere it cannot cost you anything.', describing a $10,000.00 virtual balance that never touches a wallet or a blockchain. The same sample-data banner appears above a panel headed 'What this does not do': no keys or signatures can move a real asset, no fees, gas, or slippage are modelled, and past simulated results say nothing about future real ones.",
      },
      {
        src: "/stock-school-onchain.png",
        alt: "The On-Chain Lab, headed 'Everything else here is our word for it. This page is not.', with a contract-address field that accepts an address or a block-explorer link beside a 'Read contract' button, and network chips for Ethereum, BNB Smart Chain, and Base. A note reads 'We only ever read from a contract. No wallet, no signature, nothing written.'",
      },
      {
        src: "/stock-school-progress.png",
        alt: "The Progress page, headed 'Everything you have finished, and nothing you have not.', stating plainly that it keeps no streaks and no badges. A panel records 1 of 8 lessons completed — '2 opened, 6 still marked later' — with 0 of 5 missions passed, no quiz attempted yet, and 7 lessons left in the course, above a quiz record section noting a 70% pass mark.",
      },
    ],
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
