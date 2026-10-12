import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatEnquiry,
  formatSubject,
  isEmailConfigured,
  sendContactEmail,
} from "@/lib/email/send";
import type { ContactRequest } from "@/types";

/**
 * Email delivery (TRD section 15: "email provider error handling").
 *
 * Two properties matter beyond the happy path: the endpoint must never report
 * success when nothing was sent, and no log line may contain what the visitor
 * wrote.
 */

const enquiry: ContactRequest = {
  name: "Ada Obi",
  email: "ada@example.com",
  projectType: "mvp-web-app",
  budgetRange: "3k-7k",
  message: "I would like to build a booking platform for a small clinic in Lagos.",
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("formatEnquiry", () => {
  it("includes every field the visitor supplied", () => {
    const body = formatEnquiry(enquiry);

    expect(body).toContain(enquiry.name);
    expect(body).toContain(enquiry.email);
    expect(body).toContain(enquiry.message);
  });

  it("renders the enumerated values as human-readable labels", () => {
    const body = formatEnquiry(enquiry);

    expect(body).toContain("MVP / Web application");
    expect(body).toContain("$3,000 – $7,000");
  });

  it("is plain text, with no markup for injected content to break out of", () => {
    const body = formatEnquiry({ ...enquiry, message: "<script>alert(1)</script>" });
    expect(body).not.toContain("<html");
    expect(body).toContain("<script>alert(1)</script>");
  });

  it("sets a reply reminder so the enquiry is answered from the right place", () => {
    expect(formatEnquiry(enquiry)).toContain("Reply directly to this email");
  });
});

describe("formatSubject", () => {
  it("names the project type and the sender", () => {
    expect(formatSubject(enquiry)).toBe(
      "Portfolio enquiry — MVP / Web application — Ada Obi",
    );
  });

  it("strips newlines so a crafted name cannot forge extra mail headers", () => {
    const subject = formatSubject({
      ...enquiry,
      name: "Ada\r\nBcc: someone@example.com",
    });

    expect(subject).not.toContain("\r");
    expect(subject).not.toContain("\n");
    expect(subject).toContain("Ada Bcc: someone@example.com");
  });

  it("truncates a very long name so the subject stays readable", () => {
    const subject = formatSubject({ ...enquiry, name: "a".repeat(200) });
    expect(subject.length).toBeLessThan(120);
  });
});

describe("isEmailConfigured", () => {
  it("is false when nothing is set", () => {
    vi.stubEnv("EMAIL_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
    vi.stubEnv("CONTACT_EMAIL_TO", "");

    expect(isEmailConfigured()).toBe(false);
  });

  it("is false when only some values are set", () => {
    vi.stubEnv("EMAIL_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "portfolio@example.com");
    vi.stubEnv("CONTACT_EMAIL_TO", "");

    expect(isEmailConfigured()).toBe(false);
  });

  it("is false when the recipient is still an unresolved placeholder", () => {
    vi.stubEnv("EMAIL_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "portfolio@example.com");
    vi.stubEnv("CONTACT_EMAIL_TO", "TODO: real inbox");

    expect(isEmailConfigured()).toBe(false);
  });

  it("is true when all three values are set", () => {
    vi.stubEnv("EMAIL_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "portfolio@example.com");
    vi.stubEnv("CONTACT_EMAIL_TO", "bamidele@example.com");

    expect(isEmailConfigured()).toBe(true);
  });
});

describe("sendContactEmail", () => {
  function configure() {
    vi.stubEnv("EMAIL_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "portfolio@example.com");
    vi.stubEnv("CONTACT_EMAIL_TO", "bamidele@example.com");
  }

  it("reports success once the provider accepts the message", async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const outcome = await sendContactEmail(enquiry);

    expect(outcome.delivered).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("sends the enquiry as plain text with the visitor as the reply-to address", async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendContactEmail(enquiry);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;

    expect(payload.reply_to).toBe(enquiry.email);
    expect(payload.text).toContain(enquiry.message);
    expect(payload).not.toHaveProperty("html");
  });

  it("never sends the API key anywhere but the provider", async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendContactEmail(enquiry);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");

    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer re_test_key");
    expect(String(init.body)).not.toContain("re_test_key");
  });

  it("reports failure, with a status-only reason, when the provider rejects it", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("provider detail", { status: 422 })),
    );

    const outcome = await sendContactEmail(enquiry);

    expect(outcome.delivered).toBe(false);
    expect(outcome.reason).toBe("provider_http_422");
  });

  it("does not log the provider's response body, which can echo request content", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(`rejected: ${enquiry.message}`, { status: 422 }),
      ),
    );

    await sendContactEmail(enquiry);

    const logged = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(logged).not.toContain(enquiry.message);
    expect(logged).toContain("422");
  });

  it("survives a network failure without throwing", async () => {
    configure();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const outcome = await sendContactEmail(enquiry);

    expect(outcome.delivered).toBe(false);
    expect(outcome.reason).toBe("provider_unreachable");
  });

  it("distinguishes a timeout from an unreachable provider", async () => {
    configure();
    const timeout = new Error("The operation was aborted due to timeout");
    timeout.name = "TimeoutError";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(timeout));

    const outcome = await sendContactEmail(enquiry);

    expect(outcome.reason).toBe("provider_timeout");
  });

  it("reports failure in production when email is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("EMAIL_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
    vi.stubEnv("CONTACT_EMAIL_TO", "");

    const outcome = await sendContactEmail(enquiry);

    // The endpoint must never claim an enquiry was sent when it was not.
    expect(outcome.delivered).toBe(false);
    expect(outcome.reason).toBe("email_not_configured");
  });

  it("accepts but does not deliver in development, so the form stays testable", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("EMAIL_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
    vi.stubEnv("CONTACT_EMAIL_TO", "");

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const outcome = await sendContactEmail(enquiry);

    expect(outcome.delivered).toBe(false);
    expect(outcome.reason).toBe("email_not_configured_dev_fallback");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
