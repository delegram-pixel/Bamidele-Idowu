/**
 * Content validation gate.
 *
 * Runs automatically before `yarn build` (see the `prebuild` script), so
 * unapproved or placeholder content cannot reach a production build. This is
 * the mechanical enforcement of the accuracy rules in PRD section 8 and
 * backend-schema section 9 — it does not rely on anyone remembering them.
 *
 * Run it on its own with `yarn validate:content`.
 */

import { getBlockingIssues, validateContent, type ContentIssue } from "../src/lib/validation/content";

const RESET = "\u001b[0m";
const RED = "\u001b[31m";
const YELLOW = "\u001b[33m";
const DIM = "\u001b[2m";
const BOLD = "\u001b[1m";

function formatIssue(issue: ContentIssue): string {
  const marker = issue.severity === "error" ? `${RED}error${RESET}` : `${YELLOW}warn ${RESET}`;
  return `  ${marker}  ${BOLD}${issue.path}${RESET}\n         ${issue.message}`;
}

function main(): void {
  // Escape hatch for the rare case where a build is needed purely to check that
  // the code compiles. It must never be used for a production deploy: the whole
  // point of this gate is that unconfirmed content does not ship.
  if (process.env.SKIP_CONTENT_VALIDATION === "1") {
    console.warn(
      `${YELLOW}Content validation skipped (SKIP_CONTENT_VALIDATION=1). ` +
        `Do not deploy a build produced this way.${RESET}`,
    );
    return;
  }

  const issues = validateContent();
  const errors = getBlockingIssues(issues);
  const warnings = issues.filter((issue) => issue.severity === "warning");

  if (issues.length === 0) {
    console.log("Content validation passed.");
    return;
  }

  if (warnings.length > 0) {
    console.warn(`\n${YELLOW}${warnings.length} warning(s)${RESET}`);
    for (const warning of warnings) console.warn(formatIssue(warning));
  }

  if (errors.length > 0) {
    console.error(`\n${RED}${errors.length} content error(s)${RESET}`);
    for (const error of errors) console.error(formatIssue(error));

    console.error(
      `\n${DIM}Fix the items above, or set SKIP_CONTENT_VALIDATION=1 to bypass ` +
        `this check for a local compilation test only.${RESET}\n`,
    );
    process.exit(1);
  }

  console.log(`\nContent validation passed with ${warnings.length} warning(s).`);
}

main();
