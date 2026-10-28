"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

import { track } from "@/lib/analytics/track";
import type { AnalyticsEventName, AnalyticsEventPayloads } from "@/lib/analytics/events";

type TrackedLinkProps<K extends AnalyticsEventName> = {
  href: string;
  /** Event fired on click. Must exist in the analytics catalogue. */
  event: K;
  /**
   * Event properties, typed against the catalogue. A payload the catalogue does
   * not define for this event is a compile error, which is what keeps personal
   * data out of analytics — there is no shape for it to travel in.
   */
  eventProps?: AnalyticsEventPayloads[K];
  onNavigate?: () => void;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">;

/**
 * An anchor that reports an analytics event when activated.
 *
 * Exists so sections can remain Server Components while still recording CTA
 * clicks: only this leaf needs to be a Client Component (TRD section 3,
 * "Use Server Components by default").
 *
 * Tracking is fire-and-forget — `track()` never throws — so a failure in
 * analytics can never prevent navigation.
 */
export function TrackedLink<K extends AnalyticsEventName>({
  href,
  event,
  eventProps,
  onNavigate,
  children,
  ...rest
}: TrackedLinkProps<K>) {
  const handleClick = () => {
    onNavigate?.();
    track(event, eventProps);
  };

  // Internal routes use the client-side router so the visitor does not pay for
  // a full document reload. Hash and off-site links stay plain anchors: one is
  // a same-page jump, the other is not ours to route.
  const isInternalRoute = href.startsWith("/") && !href.startsWith("//");

  if (isInternalRoute) {
    return (
      <Link href={href} onClick={handleClick} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
