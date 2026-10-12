import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/contact/route";
import { resetRateLimitStore } from "@/lib/rate-limit";
import { MIN_FILL_TIME_MS } from "@/lib/validation/contact";
import type { ContactErrorResponse, ContactResponse } from "@/types";

/**
 * POST /api/contact integration (TRD section 15).
 *
 * These drive the real route handler: real Zod validation, real rate limiter,
 * real spam checks. Only the outbound email call is stubbed.
 */

const VALID_BODY = {
  name: "Ada Obi",
  email: "ada@example.com",
  projectType: "mvp-web-app",
  budgetRange: "3k-7k",
  message: "I would like to build a booking platform for a small clinic in Lagos.",
  company: "",
  elapsedMs: MIN_FILL_TIME_MS + 5000,
};

function post(
  body: unknown,
  { ip = "203.0.113.10", raw }: { ip?: string; raw?: string } = {},
): Promise<Response> {
  const request = new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: raw ?? JSON.stringify(body),
  });

  return POST(request);
}

/** Configure a working email path so the request reaches a 200. */
function configureEmail() {
  vi.stubEnv("EMAIL_API_KEY", "re_test_key");
  vi.stubEnv("EMAIL_FROM", "portfolio@example.com");
  vi.stubEnv("CONTACT_EMAIL_TO", "bamidele@example.com");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
}

/**
 * Narrow a response body to its failure variant.
 *
 * `ContactResponse` is a discriminated union and `code` exists only on the error
 * branch, so reading it needs a real check rather than a cast. Throwing is the
 * right failure here: the three assertions that use this are all about *why* a
 * request was refused, so a success body reaching one of them would mean the
 * endpoint answered something else entirely — and a typed cast would have
 * quietly turned that into `undefined` compared against a string.
 */
function expectErrorBody(body: ContactResponse): ContactErrorResponse {
  if (body.ok) {
    throw new Error("Expected an error response, but the endpoint reported success.");
  }

  return body;
}

beforeEach(() => {
  resetRateLimitStore();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET", () => {
  it("answers a non-POST caller with JSON rather than an HTML error page", async () => {
    const response = GET();
    const body = (await response.json()) as ContactResponse;

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
    expect(body.ok).toBe(false);
  });
});

describe("successful submission", () => {
  it("returns 200 and confirms the message was sent", async () => {
    configureEmail();

    const response = await post(VALID_BODY);
    const body = (await response.json()) as ContactResponse;

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it("delivers the enquiry to the provider", async () => {
    configureEmail();

    await post(VALID_BODY);

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.resend.com/emails");
  });

  it("accepts a submission with no timing data, since the field is advisory", async () => {
    configureEmail();

    const { elapsedMs: _omitted, ...withoutTiming } = VALID_BODY;
    const response = await post(withoutTiming);

    expect(response.status).toBe(200);
  });

  it("trims the submitted values before delivering them", async () => {
    configureEmail();

    await post({ ...VALID_BODY, name: "  Ada Obi  " });

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(init.body)) as { text: string };

    expect(payload.text).toMatch(/Name:\s+Ada Obi\b/);
    expect(payload.text).not.toContain("  Ada Obi  ");
  });
});

describe("input validation", () => {
  it("rejects a body that is not JSON", async () => {
    const response = await post(null, { raw: "{ this is not json" });
    const body = expectErrorBody((await response.json()) as ContactResponse);

    expect(response.status).toBe(400);
    expect(body.code).toBe("invalid_input");
  });

  it("returns field-level errors for an invalid submission", async () => {
    const response = await post({ ...VALID_BODY, name: "", email: "nope" });
    const body = (await response.json()) as ContactResponse & {
      fieldErrors?: Record<string, string>;
    };

    expect(response.status).toBe(400);
    expect(body.fieldErrors).toHaveProperty("name");
    expect(body.fieldErrors).toHaveProperty("email");
  });

  it("rejects a project type outside the offered options", async () => {
    const response = await post({ ...VALID_BODY, projectType: "spaceship" });
    expect(response.status).toBe(400);
  });

  it("does not attempt delivery for an invalid submission", async () => {
    configureEmail();

    await post({ ...VALID_BODY, message: "too short" });

    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("spam checks", () => {
  it("rejects a submission that filled the honeypot", async () => {
    configureEmail();

    const response = await post({ ...VALID_BODY, company: "Acme Corp" });
    const body = (await response.json()) as ContactResponse;

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  it("does not disclose which check rejected the submission", async () => {
    configureEmail();

    const response = await post({ ...VALID_BODY, company: "Acme Corp" });
    const body = (await response.json()) as ContactResponse;

    // A bot that learns the honeypot exists simply stops filling it in.
    expect(body.message).not.toMatch(/honeypot|spam|bot|company/i);
  });

  it("rejects a submission filled in faster than a human could type it", async () => {
    configureEmail();

    const response = await post({ ...VALID_BODY, elapsedMs: MIN_FILL_TIME_MS - 1 });
    expect(response.status).toBe(400);
  });

  it("never delivers rejected spam to the inbox", async () => {
    configureEmail();

    await post({ ...VALID_BODY, company: "Acme Corp" });
    await post({ ...VALID_BODY, elapsedMs: 10 });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("allows a submission that took exactly the minimum time", async () => {
    configureEmail();

    const response = await post({ ...VALID_BODY, elapsedMs: MIN_FILL_TIME_MS });
    expect(response.status).toBe(200);
  });
});

describe("rate limiting", () => {
  it("allows five submissions and rejects the sixth with a Retry-After header", async () => {
    configureEmail();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await post(VALID_BODY);
      expect(response.status).toBe(200);
    }

    const blocked = await post(VALID_BODY);
    const body = expectErrorBody((await blocked.json()) as ContactResponse);

    expect(blocked.status).toBe(429);
    expect(body.code).toBe("rate_limited");
    expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("does not deliver the rate-limited submission", async () => {
    configureEmail();

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await post(VALID_BODY);
    }

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(5);
  });

  it("limits each client independently", async () => {
    configureEmail();

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await post(VALID_BODY, { ip: "203.0.113.10" });
    }

    const otherClient = await post(VALID_BODY, { ip: "198.51.100.4" });
    expect(otherClient.status).toBe(200);
  });

  it("suggests a fallback the visitor can actually use", async () => {
    configureEmail();

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await post(VALID_BODY);
    }

    const body = (await (await post(VALID_BODY)).json()) as ContactResponse;
    expect(body.message).toMatch(/email me directly/i);
  });
});

describe("delivery failure", () => {
  it("returns 502 when the provider rejects the message", async () => {
    configureEmail();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("provider says no", { status: 422 })),
    );

    const response = await post(VALID_BODY);
    const body = expectErrorBody((await response.json()) as ContactResponse);

    expect(response.status).toBe(502);
    expect(body.code).toBe("delivery_failed");
  });

  it("never reports success when the provider failed", async () => {
    configureEmail();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const body = (await (await post(VALID_BODY)).json()) as ContactResponse;
    expect(body.ok).toBe(false);
  });

  it("does not leak the provider's response body to the visitor", async () => {
    configureEmail();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("internal detail here", { status: 500 })),
    );

    const response = await post(VALID_BODY);
    const raw = await response.text();

    expect(raw).not.toContain("internal detail here");
    expect(raw).not.toContain("resend");
  });

  it("returns 502 rather than a false success in production without email configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("EMAIL_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
    vi.stubEnv("CONTACT_EMAIL_TO", "");

    const response = await post(VALID_BODY);
    expect(response.status).toBe(502);
  });
});

describe("response hygiene", () => {
  it("never echoes the visitor's message back in an error response", async () => {
    configureEmail();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const response = await post({ ...VALID_BODY, message: `${VALID_BODY.message} SECRET` });
    const raw = await response.text();

    expect(raw).not.toContain("SECRET");
  });

  it("survives a malformed provider response without exposing internals", async () => {
    configureEmail();
    // A provider returning a shape the code does not expect must still resolve to
    // a clean failure, not an unhandled throw with a stack trace in the body.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: "unexpected" }));

    const response = await post(VALID_BODY);
    const raw = await response.text();

    expect(raw).not.toMatch(/at .*\.ts:\d+/);
    expect([502, 500]).toContain(response.status);
  });
});
