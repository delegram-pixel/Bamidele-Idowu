import type { PricingFallback, PricingItem } from "@/types";

/**
 * Pricing configuration.
 *
 * PRD section 7.6 and app-flow section 8 are unambiguous: do not publish
 * fabricated prices. No price has been confirmed yet, so every item below is
 * `visible: false` and the section renders the transparent quotation
 * explanation instead.
 *
 * To publish a confirmed figure: set `amount`, `currency`, and `visible: true`.
 * The validator rejects a visible item that is missing an amount.
 */
export const pricingItems: PricingItem[] = [
  {
    serviceSlug: "mvp-web-app",
    label: "MVPs & Web Applications",
    description: "Scoped per product, from a focused first version upward.",
    visible: false,
  },
  {
    serviceSlug: "business-website",
    label: "Business Websites",
    description: "Scoped per site, based on page count and content requirements.",
    visible: false,
  },
  {
    serviceSlug: "javascript-training",
    label: "JavaScript Training",
    description: "Scoped per engagement, based on cohort size and duration.",
    visible: false,
  },
  {
    serviceSlug: "code-review",
    label: "Code Review & Technical Guidance",
    description: "Scoped per engagement, based on codebase size.",
    visible: false,
  },
];

/**
 * Shown whenever no numeric prices are visible. This is the honest alternative
 * the spec asks for: explain how a quote is actually calculated, concretely.
 */
export const pricingFallback: PricingFallback = {
  heading: "Every project is quoted individually",
  explanation:
    "Rather than publish a number that would be wrong for most people, I scope each project and quote it properly. You get a fixed written scope and price before any work starts, and the quote does not move unless you change the scope.",
  factors: [
    "How much of the product already exists, in design or in code",
    "The number and complexity of the core user flows",
    "Whether content, copy, and imagery are ready or need producing",
    "Integrations with systems you already use",
    "How soon you need it, and whether that changes the plan",
  ],
};
