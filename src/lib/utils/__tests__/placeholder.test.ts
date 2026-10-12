import { describe, expect, it } from "vitest";

import { findPlaceholders, isPlaceholder, isUnresolved } from "@/lib/utils/placeholder";

/**
 * Placeholder detection.
 *
 * This is the mechanism that stops unconfirmed copy from shipping, so its
 * behaviour is worth pinning down precisely.
 */

describe("isPlaceholder", () => {
  it("detects a leading TODO marker", () => {
    expect(isPlaceholder("TODO: confirm role")).toBe(true);
  });

  it("detects a marker anywhere in the string", () => {
    expect(isPlaceholder("Built by TODO: someone")).toBe(true);
  });

  it("does not match ordinary prose", () => {
    expect(isPlaceholder("A finished sentence about a real project.")).toBe(false);
  });

  it("ignores non-string values", () => {
    expect(isPlaceholder(42)).toBe(false);
    expect(isPlaceholder(null)).toBe(false);
    expect(isPlaceholder(undefined)).toBe(false);
  });
});

describe("isUnresolved", () => {
  it.each([undefined, null, "", "   "])("treats %s as unresolved", (value) => {
    expect(isUnresolved(value)).toBe(true);
  });

  it("treats a placeholder as unresolved", () => {
    expect(isUnresolved("TODO: real email")).toBe(true);
  });

  it("treats real content as resolved", () => {
    expect(isUnresolved("https://wa.me/2348000000000")).toBe(false);
  });

  it("treats non-string values as resolved, since they are not placeholders", () => {
    expect(isUnresolved(0)).toBe(false);
  });
});

describe("findPlaceholders", () => {
  it("reports the dotted path of a nested placeholder", () => {
    const data = {
      projects: [{ slug: "a", role: "Developer" }, { slug: "b", role: "TODO: confirm" }],
    };

    expect(findPlaceholders(data)).toEqual(["root.projects[1].role"]);
  });

  it("finds placeholders in deeply nested arrays and objects", () => {
    const data = { a: { b: [{ c: { d: "TODO: deep" } }] } };
    expect(findPlaceholders(data)).toEqual(["root.a.b[0].c.d"]);
  });

  it("returns nothing when all content is resolved", () => {
    expect(findPlaceholders({ a: "fine", b: ["also fine"] })).toEqual([]);
  });

  it("does not descend into non-string primitives", () => {
    expect(findPlaceholders({ count: 3, flag: true, nothing: null })).toEqual([]);
  });
});
