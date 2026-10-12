/**
 * Analytics event catalogue (TRD section 10).
 *
 * Naming and payloads live here so every call site is type-checked against the
 * same list. Events carry **no personal data** — no form contents, no email
 * addresses, no message text. Only identifiers the code itself defines.
 */

export const ANALYTICS_EVENTS = {
  heroContactClick: "hero_contact_click",
  heroWorkClick: "hero_work_click",
  projectOpen: "project_open",
  contactFormStart: "contact_form_start",
  contactFormSuccess: "contact_form_success",
  contactFormError: "contact_form_error",
  emailClick: "email_click",
  whatsappClick: "whatsapp_click",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * Event payloads.
 *
 * `contact_form_error` deliberately records only a coarse code, never the
 * visitor's input or the server's message.
 */
export interface AnalyticsEventPayloads {
  [ANALYTICS_EVENTS.heroContactClick]: undefined;
  [ANALYTICS_EVENTS.heroWorkClick]: undefined;
  [ANALYTICS_EVENTS.projectOpen]: { slug: string; source: "work" | "case-study" };
  [ANALYTICS_EVENTS.contactFormStart]: undefined;
  [ANALYTICS_EVENTS.contactFormSuccess]: undefined;
  [ANALYTICS_EVENTS.contactFormError]: { code: string };
  [ANALYTICS_EVENTS.emailClick]: undefined;
  [ANALYTICS_EVENTS.whatsappClick]: undefined;
}

export type AnalyticsEvent = {
  [K in AnalyticsEventName]: {
    name: K;
    props?: AnalyticsEventPayloads[K];
  };
}[AnalyticsEventName];

/**
 * Provider configuration. Both values must be present for analytics to be
 * enabled; otherwise every call is a no-op and the site behaves identically
 * (app-flow section 13: "Analytics unavailable → keep the website fully
 * functional").
 */
export function getAnalyticsConfig(): { src: string; domain: string } | undefined {
  const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC?.trim();
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN?.trim();

  if (!src || !domain) return undefined;
  return { src: src.replace(/\/+$/, ""), domain };
}
