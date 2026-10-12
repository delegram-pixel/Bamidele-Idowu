import { describe, expect, it } from "vitest";

import { absoluteUrl, isSafeExternalUrl, mailtoUrl, whatsappUrl } from "@/lib/utils/url";

/**
 * URL safety (backend-schema section 10: "validate external URLs before
 * rendering links").
 */

describe("isSafeExternalUrl", () => {
  it.each([
    "https://example.com",
    "http://example.com",
    "https://example.com/path?query=1#hash",
    "mailto:hello@example.com",
    "tel:+2348000000000",
  ])("accepts %s", (url) => {
    expect(isSafeExternalUrl(url)).toBe(true);
  });

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ])("rejects the unsafe scheme in %s", (url) => {
    expect(isSafeExternalUrl(url)).toBe(false);
  });

  it.each(["", "not a url", "/relative/path", "example.com"])(
    "rejects the non-absolute value %s",
    (url) => {
      expect(isSafeExternalUrl(url)).toBe(false);
    },
  );

  it("rejects undefined", () => {
    expect(isSafeExternalUrl(undefined)).toBe(false);
  });
});

describe("absoluteUrl", () => {
  it("joins a host and path", () => {
    expect(absoluteUrl("/work/example", "https://example.com")).toBe(
      "https://example.com/work/example",
    );
  });

  it("does not double up slashes when the base has a trailing slash", () => {
    expect(absoluteUrl("/work/example", "https://example.com/")).toBe(
      "https://example.com/work/example",
    );
  });

  it("adds a leading slash when the path lacks one", () => {
    expect(absoluteUrl("work/example", "https://example.com")).toBe(
      "https://example.com/work/example",
    );
  });
});

describe("mailtoUrl", () => {
  it("builds a bare mailto when there is no subject", () => {
    expect(mailtoUrl("hello@example.com")).toBe("mailto:hello@example.com");
  });

  it("encodes the subject so spaces and punctuation survive", () => {
    expect(mailtoUrl("hello@example.com", "Project enquiry & quote")).toBe(
      "mailto:hello@example.com?subject=Project%20enquiry%20%26%20quote",
    );
  });
});

describe("whatsappUrl", () => {
  it("returns undefined when nothing is configured, so no dead link is rendered", () => {
    expect(whatsappUrl(undefined)).toBeUndefined();
  });

  it("returns undefined for an unsafe configured value", () => {
    expect(whatsappUrl("javascript:alert(1)")).toBeUndefined();
  });

  it("appends an encoded message using ? when the URL has no query", () => {
    expect(whatsappUrl("https://wa.me/2348000000000", "Hi there")).toBe(
      "https://wa.me/2348000000000?text=Hi%20there",
    );
  });

  it("appends with & when the URL already has a query string", () => {
    expect(whatsappUrl("https://wa.me/2348000000000?lang=en", "Hi")).toBe(
      "https://wa.me/2348000000000?lang=en&text=Hi",
    );
  });
});
