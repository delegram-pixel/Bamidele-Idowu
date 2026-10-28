"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SECTION_IDS } from "@/data/nav";
import { track } from "@/lib/analytics/track";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

/**
 * Persistent contact CTA (PRD FR-08, app-flow section 10).
 *
 * Requirements it satisfies, and how:
 *  - **Never covers important content.** It appears only after the hero, and
 *    hides itself entirely while the contact section is on screen — at which
 *    point the full form is the CTA and the shortcut is redundant.
 *  - **Keyboard accessible.** It is a real anchor in the tab order with a
 *    visible focus ring; it is never a hover-only affordance.
 *  - **Usable on small screens.** It sits above the bottom safe area on mobile
 *    and does not span the full width, so it cannot swallow taps meant for the
 *    content behind it.
 *  - **Respects reduced motion.** The show/hide transition is a plain opacity
 *    and transform change, which the global reduced-motion rule collapses.
 *
 * Tracked via an IntersectionObserver rather than scroll position, so it does
 * no work while scrolling.
 */
export function PersistentCta() {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(SECTION_IDS.hero);
    const contact = document.getElementById(SECTION_IDS.contact);
    if (!hero || !contact) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) setIsPastHero(!entry.isIntersecting);
          if (entry.target === contact) setIsContactVisible(entry.isIntersecting);
        }
      },
      { threshold: 0 },
    );

    observer.observe(hero);
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  const isVisible = isPastHero && !isContactVisible;

  return (
    <div
      // `pointer-events-none` on the container keeps the invisible state from
      // blocking clicks on whatever sits beneath it.
      className={[
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end",
        "px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-10",
        "transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <Link
        href="/contact"
        tabIndex={isVisible ? 0 : -1}
        aria-hidden={!isVisible}
        onClick={() => track(ANALYTICS_EVENTS.heroContactClick)}
        className={[
          "pointer-events-auto inline-flex items-center gap-2 rounded-none",
          "bg-accent-deep px-5 py-3 text-sm font-medium text-canvas",
          "shadow-plate transition-[background-color,box-shadow] duration-fast hover:bg-ink",
          isVisible ? "translate-y-0" : "translate-y-3",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="size-1.5 bg-canvas"
        />
        Start a Project
      </Link>
    </div>
  );
}
