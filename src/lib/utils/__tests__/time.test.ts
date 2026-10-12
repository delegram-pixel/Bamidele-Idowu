import { describe, expect, it } from "vitest";

import {
  TIME_PLACEHOLDER,
  formatDateInZone,
  formatTimeInZone,
  getGreeting,
  getUtcOffsetLabel,
} from "@/lib/utils/time";

/**
 * Local clock formatting (TRD section 15, unit tests; section 8 requirements).
 *
 * The clock is a correctness feature, not decoration: the PRD requires it to
 * show the right Port Harcourt time. These tests pin the behaviour to the IANA
 * zone rather than to the machine running them.
 */

const LAGOS = "Africa/Lagos";

describe("formatTimeInZone", () => {
  it("formats in 24-hour form with seconds", () => {
    // 12:30 UTC is 13:30 in Lagos (UTC+1, no daylight saving).
    const result = formatTimeInZone(new Date("2026-03-10T12:30:45Z"), LAGOS);
    expect(result).toBe("13:30:45");
  });

  it("omits seconds when asked", () => {
    const result = formatTimeInZone(new Date("2026-03-10T12:30:45Z"), LAGOS, {
      withSeconds: false,
    });
    expect(result).toBe("13:30");
  });

  it("is independent of the host machine's time zone", () => {
    // The same instant must format identically regardless of where this runs.
    const instant = new Date("2026-07-01T23:15:00Z");
    expect(formatTimeInZone(instant, LAGOS)).toBe("00:15:00");
  });

  it("handles the end of a Lagos day rolling into the next UTC day", () => {
    const result = formatTimeInZone(new Date("2026-07-01T23:59:00Z"), LAGOS);
    expect(result).toBe("00:59:00");
  });
});

describe("formatDateInZone", () => {
  it("formats a short weekday, day, and month", () => {
    // 1 January 2026 is a Thursday. Matched loosely on separators because ICU
    // punctuation differs between Node releases; the parts themselves are what
    // matter.
    expect(formatDateInZone(new Date("2026-01-01T12:00:00Z"), LAGOS)).toMatch(
      /^Thu\W+1\W+Jan$/,
    );
  });

  it("uses the Lagos date, not the UTC date, near midnight", () => {
    // 23:30 UTC on 1 January is already 2 January in Lagos.
    expect(formatDateInZone(new Date("2026-01-01T23:30:00Z"), LAGOS)).toMatch(
      /^Fri\W+2\W+Jan$/,
    );
  });
});

describe("getUtcOffsetLabel", () => {
  it("reports Lagos as UTC+01:00", () => {
    expect(getUtcOffsetLabel(new Date("2026-03-10T12:00:00Z"), LAGOS)).toBe("UTC+01:00");
  });
});

describe("getGreeting", () => {
  it.each([
    ["2026-03-10T06:00:00Z", "Good morning"], // 07:00 Lagos
    ["2026-03-10T12:00:00Z", "Good afternoon"], // 13:00 Lagos
    ["2026-03-10T19:00:00Z", "Good evening"], // 20:00 Lagos
  ])("greets appropriately at %s", (instant, expected) => {
    expect(getGreeting(new Date(instant), LAGOS)).toBe(expected);
  });

  it("treats the boundary at noon as afternoon, in Lagos time", () => {
    // 11:00 UTC is 12:00 Lagos — the first afternoon hour.
    expect(getGreeting(new Date("2026-03-10T11:00:00Z"), LAGOS)).toBe("Good afternoon");
  });
});

describe("TIME_PLACEHOLDER", () => {
  it("matches the width of a formatted time, so nothing shifts when it is replaced", () => {
    const formatted = formatTimeInZone(new Date("2026-03-10T12:30:45Z"), LAGOS);
    expect(TIME_PLACEHOLDER).toHaveLength(formatted.length);
  });
});
