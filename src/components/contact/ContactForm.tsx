"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useContactPrefill } from "@/components/contact/ContactPrefillContext";
import { BUDGET_OPTIONS, PROJECT_TYPE_OPTIONS } from "@/data/contact-options";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { contactSchema } from "@/lib/validation/contact";
import { cn } from "@/lib/utils/cn";
import type { ContactResponse } from "@/types";

type FormStatus = "idle" | "submitting" | "success" | "error";
type FieldName = "name" | "email" | "projectType" | "budgetRange" | "message";

interface FormValues {
  name: string;
  email: string;
  projectType: string;
  budgetRange: string;
  /**
   * The enquiry itself. Present from the start rather than added with the
   * textarea: it was missing from this interface once, and because the field is
   * read in three places and never written anywhere else, the omission did not
   * surface as a broken form — it surfaced as `values.message` being `undefined`
   * at validation time, which the schema rejects, so *every* submission failed
   * validation while looking like an ordinary bad-input error to the visitor.
   */
  message: string;
  /** Honeypot. Never rendered visibly; see the field markup below. */
  company: string;
}

const EMPTY_VALUES: FormValues = {
  name: "",
  email: "",
  projectType: "",
  budgetRange: "",
  message: "",
  company: "",
};

/* Fields sit on a white plate, so they are filled with the blush canvas rather
   than another white — the field would otherwise be invisible against its own
   container and the hairline would be doing all the work alone. The radius is
   the 2px plate radius, not a pill: the catalogue language has no pills. */
const INPUT_STYLES =
  "w-full rounded-plate border border-line-strong bg-canvas px-4 py-3 text-base text-ink " +
  // The placeholder is supplemental on every field here — each one has a real
  // `<label>` — so it may use the faint token, which is not a body-text weight.
  "placeholder:text-ink-faint transition-colors duration-fast " +
  "hover:border-ink/50 focus:border-ink focus:outline-none";

/* `red-400` was the dark-theme error colour and measures 2.51:1 on blush. The
   error state is not decorative, so it moves to a red that clears AA on both
   the blush field fill and the white plate. */
const INPUT_ERROR_STYLES = "border-red-700/70 focus:border-red-700";

const ERROR_TEXT_STYLES = "text-red-700";

/**
 * Contact form (PRD section 7.7, app-flow section 9, TRD section 9).
 *
 * Behaviour required by the specs, and where it lives:
 *  - **Never clears input on error.** Values live in React state and are only
 *    reset after a confirmed success.
 *  - **Accessible feedback.** Each control is labelled, errors are wired via
 *    `aria-describedby` and `aria-invalid`, and the outcome is announced through
 *    a single polite live region rather than moving focus around.
 *  - **Validation is not trusted to the client.** The same Zod schema is
 *    imported by the API route, which validates every submission again.
 *  - **Spam protection.** A honeypot field and a minimum fill time, both
 *    invisible to a real visitor and both checked server-side.
 *  - **No personal data in analytics.** Only event names and coarse error codes
 *    are sent; see `lib/analytics/events.ts` for the typed payload contract.
 */
export function ContactForm() {
  const prefill = useContactPrefill();
  const formId = useId();

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Tracks whether the form has been started, so `contact_form_start` fires
  // exactly once per visit rather than on every keystroke.
  const hasStartedRef = useRef(false);
  // When the visitor first touched the form, used for the elapsed-time check.
  const startedAtRef = useRef<number | null>(null);
  const confirmationRef = useRef<HTMLHeadingElement>(null);

  /**
   * Apply a project type chosen elsewhere on the page (a service CTA).
   * Only fills the field; it never submits or overwrites a choice the visitor
   * has already made themselves.
   */
  useEffect(() => {
    if (!prefill.projectType) return;
    setValues((current) => ({ ...current, projectType: prefill.projectType ?? "" }));
  }, [prefill.projectType]);

  const markStarted = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startedAtRef.current = Date.now();
    track(ANALYTICS_EVENTS.contactFormStart);
  }, []);

  const handleChange = useCallback(
    (field: keyof FormValues, value: string) => {
      markStarted();
      setValues((current) => ({ ...current, [field]: value }));

      // Clear a field's error as soon as the visitor edits it — leaving a stale
      // error under a field someone is actively fixing is unhelpful.
      if (field !== "company") {
        setFieldErrors((current) => {
          if (!(field in current)) return current;
          const next = { ...current };
          delete next[field as FieldName];
          return next;
        });
      }
    },
    [markStarted],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (status === "submitting") return;

      setStatusMessage("");

      // Client-side check for fast feedback. The server repeats it regardless.
      const parsed = contactSchema.safeParse({
        name: values.name,
        email: values.email,
        projectType: values.projectType,
        budgetRange: values.budgetRange,
        message: values.message,
      });

      if (!parsed.success) {
        const errors: Partial<Record<FieldName, string>> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as FieldName | undefined;
          if (key && !(key in errors)) errors[key] = issue.message;
        }

        setFieldErrors(errors);
        setStatus("error");
        setStatusMessage("Please check the highlighted fields and try again.");
        track(ANALYTICS_EVENTS.contactFormError, { code: "invalid_input" });

        // Move focus to the first problem so keyboard users are not left
        // hunting for what failed.
        const firstInvalid = Object.keys(errors)[0];
        if (firstInvalid) {
          document.getElementById(`${formId}-${firstInvalid}`)?.focus();
        }
        return;
      }

      setStatus("submitting");
      setFieldErrors({});

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...parsed.data,
            // Honeypot and timing, both inspected server-side.
            company: values.company,
            elapsedMs: startedAtRef.current ? Date.now() - startedAtRef.current : undefined,
          }),
        });

        const data = (await response.json()) as ContactResponse;

        if (data.ok) {
          setStatus("success");
          setStatusMessage(data.message);
          setValues(EMPTY_VALUES);
          hasStartedRef.current = false;
          startedAtRef.current = null;
          track(ANALYTICS_EVENTS.contactFormSuccess);

          // Focus the confirmation so a screen reader lands on the outcome.
          requestAnimationFrame(() => confirmationRef.current?.focus());
          return;
        }

        setStatus("error");
        setStatusMessage(data.message);
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors as Partial<Record<FieldName, string>>);
        }
        track(ANALYTICS_EVENTS.contactFormError, { code: data.code });
      } catch {
        // Network-level failure. The visitor's input is untouched.
        setStatus("error");
        setStatusMessage(
          "Something went wrong sending your message. Please try again, or email me directly.",
        );
        track(ANALYTICS_EVENTS.contactFormError, { code: "network_error" });
      }
    },
    [formId, status, values],
  );

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col gap-4 rounded-plate border border-line-strong bg-canvas p-8"
      >
        <CheckCircle2 aria-hidden="true" className="size-6 text-ink" />
        <h3 ref={confirmationRef} tabIndex={-1} className="font-display text-xl text-ink">
          Message sent
        </h3>
        <p className="text-sm leading-relaxed text-ink-muted">{statusMessage}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setStatusMessage("");
          }}
          className="label-meta self-start border-b border-line-strong pb-1 text-ink transition-colors duration-fast hover:border-ink"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Honeypot.
          Hidden with a technique that removes it from the accessibility tree and
          from the tab order, so it cannot be reached or announced. Real users
          never interact with it; naive bots fill in every field they find. The
          label is present because some bots check for one. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${formId}-company`}>Company (leave this empty)</label>
        <input
          id={`${formId}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(event) => handleChange("company", event.target.value)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id={`${formId}-name`}
          label="Your name"
          error={fieldErrors.name}
          required
        >
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(event) => handleChange("name", event.target.value)}
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined}
            className={cn(INPUT_STYLES, fieldErrors.name && INPUT_ERROR_STYLES)}
            placeholder="Ada Obi"
          />
        </Field>

        <Field
          id={`${formId}-email`}
          label="Email address"
          error={fieldErrors.email}
          required
        >
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(event) => handleChange("email", event.target.value)}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? `${formId}-email-error` : undefined}
            className={cn(INPUT_STYLES, fieldErrors.email && INPUT_ERROR_STYLES)}
            placeholder="you@company.com"
          />
        </Field>

        <Field
          id={`${formId}-projectType`}
          label="Project type"
          error={fieldErrors.projectType}
          required
        >
          <select
            id={`${formId}-projectType`}
            name="projectType"
            required
            value={values.projectType}
            onChange={(event) => {
              handleChange("projectType", event.target.value);
              // The visitor has now made their own choice, so the pre-selection
              // has served its purpose and must not reapply.
              prefill.clearProjectType();
            }}
            aria-invalid={fieldErrors.projectType ? true : undefined}
            aria-describedby={
              fieldErrors.projectType ? `${formId}-projectType-error` : undefined
            }
            className={cn(
              INPUT_STYLES,
              "appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat",
              fieldErrors.projectType && INPUT_ERROR_STYLES,
            )}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237F1734' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="">Please choose…</option>
            {PROJECT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id={`${formId}-budgetRange`}
          label="Budget range"
          error={fieldErrors.budgetRange}
          required
        >
          <select
            id={`${formId}-budgetRange`}
            name="budgetRange"
            required
            value={values.budgetRange}
            onChange={(event) => handleChange("budgetRange", event.target.value)}
            aria-invalid={fieldErrors.budgetRange ? true : undefined}
            aria-describedby={
              fieldErrors.budgetRange ? `${formId}-budgetRange-error` : undefined
            }
            className={cn(
              INPUT_STYLES,
              "appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat",
              fieldErrors.budgetRange && INPUT_ERROR_STYLES,
            )}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237F1734' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="">Please choose…</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        id={`${formId}-message`}
        label="About the project"
        error={fieldErrors.message}
        required
        hint="What are you building, who is it for, and what does success look like?"
      >
        <textarea
          id={`${formId}-message`}
          name="message"
          required
          rows={6}
          value={values.message}
          onChange={(event) => handleChange("message", event.target.value)}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={cn(
            `${formId}-message-hint`,
            fieldErrors.message && `${formId}-message-error`,
          )}
          className={cn(
            INPUT_STYLES,
            "resize-y",
            fieldErrors.message && INPUT_ERROR_STYLES,
          )}
          placeholder="I am building…"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center gap-2 rounded-none bg-accent-deep px-7 py-3.5 text-base font-medium text-canvas transition-colors duration-fast hover:bg-ink hover:shadow-plate disabled:pointer-events-none disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Send enquiry"
          )}
        </button>

        <p className="label-meta text-ink-muted">Usually answered within two days.</p>
      </div>

      {/* The single live region for form outcomes. `polite` so it does not
          interrupt, and rendered empty when idle so it is always present in the
          DOM for assistive technology to observe. */}
      <div aria-live="polite" aria-atomic="true" className="min-h-6">
        {status === "error" && statusMessage ? (
          <p className={cn("flex items-start gap-2 text-sm", ERROR_TEXT_STYLES)}>
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {statusMessage}
          </p>
        ) : null}
      </div>

      {/* If JavaScript is unavailable the form cannot post, so point people at
          the alternatives that always work. */}
      <noscript>
        <p className="rounded-plate border border-line-strong bg-canvas p-4 text-sm text-ink-muted">
          This form needs JavaScript. You can still reach me by email or WhatsApp using the
          links alongside it.
        </p>
      </noscript>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

/**
 * Label, control, hint, and error wrapper.
 *
 * The error is a real element referenced by `aria-describedby` from the control
 * rather than a styled div, so it is announced when the field receives focus.
 * All ids are derived from the same `useId()` root, so nothing collides if the
 * form ever appears twice on a page.
 */
function Field({ id, label, error, hint, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-ink">
            *
          </span>
        ) : null}
      </label>

      {children}

      {hint ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-ink-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} className={cn("text-xs", ERROR_TEXT_STYLES)}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
