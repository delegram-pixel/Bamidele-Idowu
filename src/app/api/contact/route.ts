import { NextResponse } from "next/server";

import { sendContactEmail } from "@/lib/email/send";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import {
  MIN_FILL_TIME_MS,
  contactPayloadSchema,
  toFieldErrors,
} from "@/lib/validation/contact";
import type { ContactErrorResponse } from "@/types";

/**
 * POST /api/contact — accept a contact enquiry (TRD section 9).
 *
 * Order of operations, which is the order the spec prescribes:
 *   1. Rate limit by client IP.
 *   2. Parse and validate the body against the shared Zod schema.
 *   3. Apply spam checks (honeypot, minimum fill time).
 *   4. Send through the email provider.
 *   5. Report success only once the provider has accepted it.
 *
 * Error responses are deliberately opaque: no stack traces, no provider names,
 * no provider error bodies. Anything a visitor sees is a message this file
 * chose to write.
 *
 * Nothing here logs the enquiry's contents. Only coarse reason codes are logged,
 * so a log leak cannot expose what someone wrote.
 */

export const runtime = "nodejs";
// No caching, ever: this is a state-changing POST.
export const dynamic = "force-dynamic";

/** Generic message reused wherever the cause must not be disclosed. */
const SPAM_REJECTION_MESSAGE =
  "We could not accept this submission. Please try again, or email me directly.";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // --- 1. Rate limit ----------------------------------------------------
    const clientKey = getClientKey(request.headers);
    const limit = checkRateLimit(clientKey);

    if (!limit.allowed) {
      return NextResponse.json<ContactErrorResponse>(
        {
          ok: false,
          code: "rate_limited",
          message:
            "That is a few too many messages in a short time. Please wait a moment and try again, or email me directly.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      );
    }

    // --- 2. Parse ---------------------------------------------------------
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ContactErrorResponse>(
        {
          ok: false,
          code: "invalid_input",
          message: "We could not read that submission. Please try again.",
        },
        { status: 400 },
      );
    }

    const parsed = contactPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ContactErrorResponse>(
        {
          ok: false,
          code: "invalid_input",
          message: "Please check the highlighted fields and try again.",
          fieldErrors: toFieldErrors(parsed.error),
        },
        { status: 400 },
      );
    }

    const { company, elapsedMs, ...enquiry } = parsed.data;

    // --- 3. Spam checks ---------------------------------------------------
    // A filled honeypot means a bot. The response is a normal-looking failure
    // so the bot learns nothing about which check caught it.
    if (company && company.trim().length > 0) {
      return NextResponse.json<ContactErrorResponse>(
        { ok: false, code: "invalid_input", message: SPAM_REJECTION_MESSAGE },
        { status: 400 },
      );
    }

    // A human cannot read the questions and type a 30-character answer in under
    // two seconds. Absent timing data is allowed, since the field is advisory.
    if (typeof elapsedMs === "number" && elapsedMs < MIN_FILL_TIME_MS) {
      return NextResponse.json<ContactErrorResponse>(
        { ok: false, code: "invalid_input", message: SPAM_REJECTION_MESSAGE },
        { status: 400 },
      );
    }

    // --- 4. Deliver -------------------------------------------------------
    const outcome = await sendContactEmail(enquiry);

    if (!outcome.delivered) {
      // The reason is logged server-side; the visitor gets no detail.
      console.error(`[contact] Delivery failed: ${outcome.reason ?? "unknown"}`);

      return NextResponse.json<ContactErrorResponse>(
        {
          ok: false,
          code: "delivery_failed",
          message:
            "Your message could not be sent just now. Please try again shortly, or email me directly.",
        },
        { status: 502 },
      );
    }

    // --- 5. Confirm -------------------------------------------------------
    return NextResponse.json(
      {
        ok: true,
        message:
          "Thanks — your message has been sent. I will reply to the email address you provided.",
      },
      { status: 200 },
    );
  } catch {
    // Last-resort guard. The stack trace stays in the server log.
    console.error("[contact] Unexpected error handling a contact submission.");

    return NextResponse.json<ContactErrorResponse>(
      {
        ok: false,
        code: "server_error",
        message: "Something went wrong on our end. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}

/**
 * Reject anything that is not a POST with a clear status, rather than letting
 * Next.js return an HTML 405 page to a fetch caller expecting JSON.
 */
export function GET(): NextResponse {
  return NextResponse.json(
    { ok: false, code: "invalid_input", message: "Use POST to submit an enquiry." },
    { status: 405, headers: { Allow: "POST" } },
  );
}
