import { describe, expect, it } from "vitest";

import { contactSchema, contactPayloadSchema, toFieldErrors } from "@/lib/validation/contact";

/**
 * Contact validation (TRD section 15, unit tests).
 *
 * These assert the rules that protect the endpoint: required fields, length
 * limits, normalisation, and enumerated options.
 */

const validPayload = {
  name: "Ada Obi",
  email: "ada@example.com",
  projectType: "mvp-web-app" as const,
  budgetRange: "3k-7k" as const,
  message: "I would like to build a booking platform for a small clinic in Lagos.",
};

describe("contactSchema", () => {
  it("accepts a well-formed submission", () => {
    expect(contactSchema.safeParse(validPayload).success).toBe(true);
  });

  it("trims whitespace from text fields", () => {
    const result = contactSchema.parse({
      ...validPayload,
      name: "  Ada Obi  ",
      message: `   ${validPayload.message}   `,
    });

    expect(result.name).toBe("Ada Obi");
    expect(result.message).toBe(validPayload.message);
  });

  it("normalises the email address to lower case", () => {
    const result = contactSchema.parse({ ...validPayload, email: "ADA@Example.COM" });
    expect(result.email).toBe("ada@example.com");
  });

  it("rejects a name shorter than two characters", () => {
    const result = contactSchema.safeParse({ ...validPayload, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects a name over the length limit", () => {
    const result = contactSchema.safeParse({ ...validPayload, name: "a".repeat(81) });
    expect(result.success).toBe(false);
  });

  it.each(["not-an-email", "missing@tld", "@example.com", "spaces in@example.com"])(
    "rejects the invalid email %s",
    (email) => {
      expect(contactSchema.safeParse({ ...validPayload, email }).success).toBe(false);
    },
  );

  it("rejects a message below the minimum length", () => {
    const result = contactSchema.safeParse({ ...validPayload, message: "too short" });
    expect(result.success).toBe(false);
  });

  it("rejects a message over the maximum length", () => {
    const result = contactSchema.safeParse({
      ...validPayload,
      message: "a".repeat(4001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a project type outside the supported options", () => {
    const result = contactSchema.safeParse({
      ...validPayload,
      projectType: "build-me-a-spaceship",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a budget range outside the supported options", () => {
    const result = contactSchema.safeParse({
      ...validPayload,
      budgetRange: "one-million",
    });
    expect(result.success).toBe(false);
  });

  it("requires every field to be present", () => {
    expect(contactSchema.safeParse({}).success).toBe(false);
  });

  it("accepts 'not sure' as a budget range, since undecided is a valid answer", () => {
    const result = contactSchema.safeParse({ ...validPayload, budgetRange: "not-sure" });
    expect(result.success).toBe(true);
  });
});

describe("contactPayloadSchema", () => {
  it("tolerates a missing honeypot and timing value", () => {
    // The route treats absent timing as acceptable, so the schema must not
    // require it.
    expect(contactPayloadSchema.safeParse(validPayload).success).toBe(true);
  });

  it("accepts honeypot content so the route can decide how to respond", () => {
    // Validation deliberately allows a filled honeypot: rejecting it here would
    // tell a bot exactly which check caught it.
    const result = contactPayloadSchema.safeParse({ ...validPayload, company: "Acme" });
    expect(result.success).toBe(true);
  });

  it("rejects a negative elapsed time", () => {
    const result = contactPayloadSchema.safeParse({ ...validPayload, elapsedMs: -1 });
    expect(result.success).toBe(false);
  });
});

describe("toFieldErrors", () => {
  it("maps issues to their field, keeping only the first message per field", () => {
    const result = contactSchema.safeParse({ ...validPayload, name: "", email: "bad" });
    expect(result.success).toBe(false);

    if (result.success) return;
    const fieldErrors = toFieldErrors(result.error);

    expect(Object.keys(fieldErrors).sort()).toEqual(["email", "name"]);
    expect(fieldErrors.name).toBeTypeOf("string");
    expect(fieldErrors.email).toBeTypeOf("string");
  });
});
