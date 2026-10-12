import { z } from "zod";

import { BUDGET_RANGES, PROJECT_TYPES } from "@/types";

/**
 * Contact form validation.
 *
 * This schema is the single source of truth and runs on the server for every
 * submission (TRD section 9, backend-schema section 4). The client may re-use it
 * to give faster feedback, but the client is never the only line of defence.
 *
 * Length limits exist so a submission cannot be used to push an unbounded
 * payload through the email provider.
 */
export const contactSchema = z.object({
  name: z
    .string({ required_error: "Please enter your name." })
    .trim()
    .min(2, "Please enter at least 2 characters.")
    .max(80, "Please keep your name under 80 characters."),

  email: z
    .string({ required_error: "Please enter your email address." })
    .trim()
    .toLowerCase()
    .max(254, "Please enter a valid email address.")
    .email("Please enter a valid email address."),

  projectType: z.enum(PROJECT_TYPES, {
    errorMap: () => ({ message: "Please choose a project type." }),
  }),

  budgetRange: z.enum(BUDGET_RANGES, {
    errorMap: () => ({ message: "Please choose a budget range." }),
  }),

  message: z
    .string({ required_error: "Please describe your project." })
    .trim()
    .min(30, "Please give at least 30 characters so I can reply usefully.")
    .max(4000, "Please keep your message under 4000 characters."),
});

export type ValidatedContactRequest = z.infer<typeof contactSchema>;

/** Server-only: request body plus the honeypot field and a submission timestamp. */
export const contactPayloadSchema = contactSchema.extend({
  /**
   * Honeypot. Real users never see or fill this field. It is accepted as a
   * string here and inspected in the route so a bot can be rejected without
   * leaking which check caught it.
   */
  company: z.string().max(200).optional(),
  /** Milliseconds the form was on screen, used to reject instant submissions. */
  elapsedMs: z.number().int().nonnegative().optional(),
});

export type ContactPayload = z.infer<typeof contactPayloadSchema>;

/**
 * Minimum time a human plausibly needs to fill in the form. Submissions faster
 * than this are treated as automated.
 */
export const MIN_FILL_TIME_MS = 2000;

/** Turn a Zod error into a flat, field-keyed map of human-readable messages. */
export function toFieldErrors(
  error: z.ZodError<unknown>,
): Partial<Record<string, string>> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fieldErrors)) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}
