"use client";

import {
  getAnalyticsConfig,
  type AnalyticsEventName,
  type AnalyticsEventPayloads,
} from "@/lib/analytics/events";

/**
 * Client-side event tracking.
 *
 * A thin adapter over the privacy-friendly provider's custom-event API
 * (Plausible-compatible `window.plausible`). Everything funnels through
 * `track()`, so swapping providers is a single-file change.
 *
 * Safety properties, each of which matters:
 *  - Never throws. Analytics must not be able to break a conversion flow.
 *  - No-ops when unconfigured, so local development sends nothing.
 *  - Sends no personal data. See `events.ts` for the payload contract.
 */

type PlausibleFn = (eventName: string, options?: { props?: Record<string, unknown> }) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

/**
 * Report an analytics event.
 *
 * `name` and `props` are both constrained by the catalogue in `events.ts`.
 *
 * The payload is named as `AnalyticsEventPayloads[K]` rather than through
 * `Extract<AnalyticsEvent, { name: K }>`. Those describe the same type, but
 * `Extract` is a conditional, and a conditional cannot be evaluated while `K` is
 * still an unresolved type parameter: TypeScript approximates it as an
 * intersection of *every* union member, which collapses the parameter to
 * `never` and rejects every real payload at every call site. A plain indexed
 * access on the payload interface defers cleanly, so `K` stays correlated
 * between the event name and its props — which is the whole point of the pair.
 */
export function track<K extends AnalyticsEventName>(
  name: K,
  props?: AnalyticsEventPayloads[K],
): void {
  try {
    if (typeof window === "undefined") return;
    if (!getAnalyticsConfig()) return;

    const plausible = window.plausible;
    if (typeof plausible !== "function") return;

    // The catalogue is the stronger contract here; the provider below takes an
    // opaque bag and never inspects it. This is the single point where the two
    // meet, so the widening is explicit and goes through `unknown` rather than
    // pretending the two shapes are related.
    plausible(
      name,
      props ? { props: props as unknown as Record<string, unknown> } : undefined,
    );
  } catch {
    // Analytics failures are never allowed to surface to the visitor.
  }
}
