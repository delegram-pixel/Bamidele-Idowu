import type { BudgetRange, ContactProjectType } from "@/types";

/**
 * Contact form option labels.
 *
 * Values are stable identifiers shared with the server-side Zod schema; labels
 * are the human-facing text. Keeping them in one place means the client and the
 * server can never disagree about what a value means.
 */

export const PROJECT_TYPE_OPTIONS: { value: ContactProjectType; label: string }[] = [
  { value: "mvp-web-app", label: "MVP or web application" },
  { value: "business-website", label: "Business website" },
  { value: "javascript-training", label: "JavaScript training" },
  { value: "code-review", label: "Code review or technical guidance" },
  { value: "something-else", label: "Something else" },
];

export const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: "under-1k", label: "Under $1,000" },
  { value: "1k-3k", label: "$1,000 – $3,000" },
  { value: "3k-7k", label: "$3,000 – $7,000" },
  { value: "7k-plus", label: "$7,000 or more" },
  { value: "not-sure", label: "Not sure yet" },
];
