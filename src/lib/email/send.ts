import { isUnresolved } from "@/lib/utils/placeholder";
import type { ContactRequest } from "@/types";

/**
 * Contact enquiry delivery.
 *
 * Uses the Resend REST API over `fetch` rather than the SDK: it is a single
 * endpoint, so a dependency would add supply-chain surface for no gain
 * (TRD section 2: "do not install multiple libraries to solve the same
 * problem"; section 14: "avoid unnecessary dependencies").
 *
 * Emails are sent as plain text. Visitor input is never interpolated into HTML,
 * so there is no markup to escape and nothing for an injected tag to do
 * (backend-schema section 10: "avoid rendering untrusted HTML").
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface DeliveryOutcome {
  /** True when the provider confirmed acceptance. */
  delivered: boolean;
  /**
   * Why delivery did not happen. Safe to log — never contains the visitor's
   * message or the provider's raw error body.
   */
  reason?: string;
}

/** Human-readable labels, kept next to the transport so emails stay legible. */
const PROJECT_TYPE_LABELS: Record<ContactRequest["projectType"], string> = {
  "mvp-web-app": "MVP / Web application",
  "business-website": "Business website",
  "javascript-training": "JavaScript training",
  "code-review": "Code review & technical guidance",
  "something-else": "Something else",
};

const BUDGET_LABELS: Record<ContactRequest["budgetRange"], string> = {
  "under-1k": "Under $1,000",
  "1k-3k": "$1,000 – $3,000",
  "3k-7k": "$3,000 – $7,000",
  "7k-plus": "$7,000+",
  "not-sure": "Not sure yet",
};

/** Render the enquiry as a plain-text email body. */
export function formatEnquiry(enquiry: ContactRequest): string {
  return [
    "New enquiry from the portfolio site",
    "",
    `Name:         ${enquiry.name}`,
    `Email:        ${enquiry.email}`,
    `Project type: ${PROJECT_TYPE_LABELS[enquiry.projectType]}`,
    `Budget:       ${BUDGET_LABELS[enquiry.budgetRange]}`,
    "",
    "Message",
    "-------",
    enquiry.message,
    "",
    "---",
    "Reply directly to this email to respond to the enquiry.",
  ].join("\n");
}

/** Subject line, kept short and free of visitor-controlled newlines. */
export function formatSubject(enquiry: ContactRequest): string {
  const safeName = enquiry.name.replace(/[\r\n]+/g, " ").slice(0, 60);
  return `Portfolio enquiry — ${PROJECT_TYPE_LABELS[enquiry.projectType]} — ${safeName}`;
}

/**
 * Read and validate server-only email configuration.
 *
 * Returns `undefined` when incomplete rather than throwing, so the caller can
 * decide between "fail the request" and "development fallback".
 */
function readEmailConfig(): { apiKey: string; from: string; to: string } | undefined {
  const apiKey = process.env.EMAIL_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const to = process.env.CONTACT_EMAIL_TO?.trim();

  if (!apiKey || !from || !to || isUnresolved(to)) return undefined;

  return { apiKey, from, to };
}

/** True when the deployment is able to deliver email at all. */
export function isEmailConfigured(): boolean {
  return readEmailConfig() !== undefined;
}

/**
 * Send a contact enquiry.
 *
 * When credentials are absent, development and test environments fall back to a
 * logged no-op so the form is testable locally. In production a missing
 * configuration is reported as a failure — the endpoint must never tell a
 * visitor their enquiry was sent when it was not.
 */
export async function sendContactEmail(
  enquiry: ContactRequest,
): Promise<DeliveryOutcome> {
  const config = readEmailConfig();

  if (!config) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[contact] Email is not configured (EMAIL_API_KEY / EMAIL_FROM / CONTACT_EMAIL_TO). Enquiry was not delivered.",
      );
      return { delivered: false, reason: "email_not_configured" };
    }

    // Development only. Logs that a submission happened, never its contents.
    console.warn(
      "[contact] Email not configured — enquiry accepted but not delivered (development fallback).",
    );
    return { delivered: false, reason: "email_not_configured_dev_fallback" };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        // Replying goes straight back to the visitor.
        reply_to: enquiry.email,
        subject: formatSubject(enquiry),
        text: formatEnquiry(enquiry),
      }),
      // Do not hang a serverless invocation on a stalled provider.
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      // Status only. The provider's body can echo request content.
      console.error(`[contact] Email provider rejected the request (HTTP ${response.status}).`);
      return { delivered: false, reason: `provider_http_${response.status}` };
    }

    return { delivered: true };
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "TimeoutError"
        ? "provider_timeout"
        : "provider_unreachable";

    console.error(`[contact] Email delivery failed: ${reason}`);
    return { delivered: false, reason };
  }
}
