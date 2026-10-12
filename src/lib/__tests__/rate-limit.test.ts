import { beforeEach, describe, expect, it } from "vitest";

import {
  checkRateLimit,
  getClientKey,
  resetRateLimitStore,
} from "@/lib/rate-limit";

/**
 * Rate limiting (TRD section 9).
 *
 * Time is passed in explicitly rather than mocked, which keeps these tests
 * deterministic and free of fake timers.
 */

const START = new Date("2026-06-15T09:00:00Z").getTime();
const MINUTE = 60_000;

beforeEach(() => {
  resetRateLimitStore();
});

describe("checkRateLimit", () => {
  it("allows the first request and reports the remaining allowance", () => {
    const result = checkRateLimit("1.2.3.4", START);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.retryAfterSeconds).toBe(0);
  });

  it("allows five requests in a window and blocks the sixth", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(checkRateLimit("1.2.3.4", START + attempt * MINUTE).allowed).toBe(true);
    }

    const blocked = checkRateLimit("1.2.3.4", START + 5 * MINUTE);

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("reports how long to wait, based on the oldest hit in the window", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      checkRateLimit("1.2.3.4", START + attempt * MINUTE);
    }

    // The oldest hit was at START; the window closes ten minutes after it.
    const blocked = checkRateLimit("1.2.3.4", START + 5 * MINUTE);
    expect(blocked.retryAfterSeconds).toBe(5 * 60);
  });

  it("lets a caller back in once the window has passed", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      checkRateLimit("1.2.3.4", START + attempt * MINUTE);
    }

    expect(checkRateLimit("1.2.3.4", START + 5 * MINUTE).allowed).toBe(false);
    // Ten minutes after the first request, that hit has aged out.
    expect(checkRateLimit("1.2.3.4", START + 10 * MINUTE + 1).allowed).toBe(true);
  });

  it("tracks keys independently, so one visitor cannot block another", () => {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      checkRateLimit("1.2.3.4", START);
    }

    expect(checkRateLimit("1.2.3.4", START).allowed).toBe(false);
    expect(checkRateLimit("5.6.7.8", START).allowed).toBe(true);
  });

  it("never reports a negative retry delay", () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      checkRateLimit("1.2.3.4", START);
    }

    const blocked = checkRateLimit("1.2.3.4", START + 11 * MINUTE);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(0);
  });
});

describe("getClientKey", () => {
  it("uses the first entry of x-forwarded-for, which is the original client", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1, 10.0.0.2" });
    expect(getClientKey(headers)).toBe("203.0.113.5");
  });

  it("trims surrounding whitespace", () => {
    const headers = new Headers({ "x-forwarded-for": "  203.0.113.5  " });
    expect(getClientKey(headers)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip when there is no forwarded chain", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.9" });
    expect(getClientKey(headers)).toBe("198.51.100.9");
  });

  it("falls back to a shared key when no IP header is present", () => {
    // A shared key degrades to a global limit, which is safer than no limit.
    expect(getClientKey(new Headers())).toBe("unknown-client");
  });

  it("ignores an empty forwarded-for header rather than using it as a key", () => {
    const headers = new Headers({ "x-forwarded-for": "   ", "x-real-ip": "198.51.100.9" });
    expect(getClientKey(headers)).toBe("198.51.100.9");
  });
});
