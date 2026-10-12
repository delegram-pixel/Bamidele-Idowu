import type { Service } from "@/types";

/**
 * Service offers (PRD section 7.2).
 *
 * Each service must answer three questions for a non-technical reader:
 * who it is for, what they get, and what changes as a result.
 */
export const services: Service[] = [
  {
    slug: "mvp-web-app",
    title: "MVPs & Web Applications",
    summary:
      "Turning an idea into a working product you can put in front of real users.",
    idealFor:
      "Founders and small teams who need to validate an idea with something real, not a slide deck.",
    deliverables: [
      "A working, deployed web application",
      "Typed, maintainable codebase with documentation",
      "Core user flows implemented and tested",
      "A handover walkthrough so your team can keep building",
    ],
    outcome:
      "A product you can show to users, investors, or your own team, and a codebase that will not need rewriting to grow.",
    contactProjectType: "mvp-web-app",
    pricingLabel: "Quoted per project — depends on scope and complexity",
    featured: true,
  },
  {
    slug: "business-website",
    title: "Business Websites",
    summary:
      "Fast, accessible websites that explain what you do and make it easy to get in touch.",
    idealFor:
      "Small and medium-sized businesses and organisations that need a credible presence, or a rebuild of one that is holding them back.",
    deliverables: [
      "A responsive, accessible, fast-loading website",
      "Content structure that reflects how customers actually decide",
      "SEO and social-sharing metadata configured properly",
      "Analytics so you can see what is working",
    ],
    outcome:
      "A website that answers a visitor's questions quickly and turns interest into enquiries.",
    contactProjectType: "business-website",
    pricingLabel: "Quoted per project — depends on page count and content needs",
    featured: true,
  },
  {
    slug: "javascript-training",
    title: "JavaScript Training",
    summary:
      "Practical instruction in modern JavaScript and web development fundamentals.",
    idealFor:
      "Schools, bootcamps, and training teams that need an instructor who builds software professionally.",
    deliverables: [
      "A curriculum matched to your learners' starting point",
      "Live sessions or recorded material",
      "Exercises and project work with review",
      "Support materials your team can reuse",
    ],
    outcome:
      "Learners who can build and reason about real front-end code rather than recite syntax.",
    contactProjectType: "javascript-training",
    pricingLabel: "Quoted per engagement — depends on cohort size and duration",
    featured: true,
  },
  {
    slug: "code-review",
    title: "Code Review & Technical Guidance",
    summary:
      "An outside, experienced read on your codebase and the decisions behind it.",
    idealFor:
      "Teams with a codebase that has outgrown its original structure, or who want a second opinion before committing to an approach.",
    deliverables: [
      "A written review of the areas you are concerned about",
      "Prioritised, actionable recommendations",
      "A walkthrough session to discuss the findings",
      "Guidance on what to fix now versus later",
    ],
    outcome:
      "A clear picture of where the real risks are and what to do about them, without stopping feature work.",
    contactProjectType: "code-review",
    pricingLabel: "Quoted per engagement — depends on codebase size",
    featured: true,
  },
];
