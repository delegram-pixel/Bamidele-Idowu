"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { IndexNumber } from "@/components/ui/IndexNumber";
import { cn } from "@/lib/utils/cn";

interface ProjectRailProps {
  children: ReactNode;
  /** Total number of slides, used for the position indicator. */
  itemCount: number;
  /**
   * Titles of the slides, in order. Used for the index list below the rail.
   * Supplied rather than read from the children because the children are
   * opaque server-rendered nodes here — the rail must not have to inspect them.
   */
  labels: string[];
}

/**
 * Horizontal case-study rail (design-brief section 9, TRD section 6).
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS A NATIVE SCROLLER, NOT A PINNED GSAP SEQUENCE
 *
 * The specs allow a cinematic horizontal experience but warn repeatedly against
 * hijacking scrolling, trapping users, and breaking touch. The requirements:
 * "avoid scroll trapping", "preserve browser scrolling", "ensure pinned
 * horizontal sections do not trap mobile users", "do not force users to scroll
 * in a particular direction".
 *
 * So this is a real `overflow-x` container with CSS scroll snapping. That gives:
 *  - native touch momentum and rubber-banding on mobile;
 *  - trackpad horizontal gestures for free;
 *  - keyboard scrolling (the region is focusable, so arrow keys work);
 *  - working browser find-in-page, which a transform-driven carousel breaks;
 *  - no scroll interception, so the page always scrolls normally when the rail
 *    has nothing left to give;
 *  - zero GSAP and zero Lenis in the bundle.
 *
 * The trade-off is that the movement is less choreographed than a pinned
 * timeline. Section 2 of the TRD explicitly asks for the simplest library
 * combination that delivers the experience, so that is the right trade.
 * ---------------------------------------------------------------------------
 *
 * Below `lg` the container stops being a rail entirely and the same children
 * stack vertically — a narrow viewport gets the readable layout rather than a
 * cramped version of the desktop one. The index list is desktop-only for the
 * same reason: on a vertical stack there is nothing to indicate a position in.
 */
export function ProjectRail({ children, itemCount, labels }: ProjectRailProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  /** Recompute which slide is active and whether either end is still reachable. */
  const syncState = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const slides = Array.from(scroller.children) as HTMLElement[];
    if (slides.length === 0) return;

    // The active slide is whichever left edge is nearest the viewport's.
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - scroller.scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
    setCanScrollPrev(scroller.scrollLeft > 8);
    setCanScrollNext(
      scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 8,
    );
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    syncState();
    // Passive: this only reads geometry, never prevents the default scroll.
    scroller.addEventListener("scroll", syncState, { passive: true });

    const resizeObserver = new ResizeObserver(syncState);
    resizeObserver.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", syncState);
      resizeObserver.disconnect();
    };
  }, [syncState]);

  /** Move by exactly one slide, snapping the destination. */
  const scrollToIndex = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const slides = Array.from(scroller.children) as HTMLElement[];
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    const slide = slides[clamped];
    if (!slide) return;

    scroller.scrollTo({
      left: slide.offsetLeft,
      // Smooth scrolling is switched off globally under reduced motion, and the
      // CSS `scroll-behavior` on the element respects that.
      behavior: "smooth",
    });
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        scrollToIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        scrollToIndex(itemCount - 1);
      }
    },
    [activeIndex, itemCount, scrollToIndex],
  );

  return (
    <div className="relative">
      <ul
        ref={scrollerRef}
        // Focusable so the region can be scrolled with the keyboard once
        // focused, which is the standard pattern for a scrollable region.
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Selected projects. Use the left and right arrow keys to move between projects."
        className={cn(
          // Mobile: a plain vertical stack. No rail, no snapping, nothing hidden.
          "flex flex-col gap-16",
          // Desktop: the horizontal rail.
          "lg:snap-x lg:snap-mandatory lg:flex-row lg:gap-8 lg:overflow-x-auto",
          "lg:no-scrollbar lg:scroll-smooth lg:pb-4",
        )}
        style={{ scrollPaddingInline: "0px" }}
      >
        {children}
      </ul>

      {/* Index and controls are desktop-only, because the rail is desktop-only.
          On mobile the same content is a vertical list and there is nothing to
          page through. */}
      <div className="mt-10 hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
        <div className="lg:col-span-4">
          {/* The oversized counter. It is driven by the same `activeIndex` the
              rail already tracks, so this adds no scroll listener of its own —
              it is a second rendering of state that already existed. */}
          <IndexNumber
            value={activeIndex + 1}
            total={itemCount}
            label={`Project ${activeIndex + 1} of ${itemCount}`}
            className="text-6xl text-ink"
          />

          {/* The index list. It is both the position indicator and a set of
              jump controls, which is why it is built from real buttons rather
              than decorative text.

              The inactive items are `ink-muted` (6.85:1) rather than the much
              fainter `ink-faint`: these are clickable, and dimming an
              interactive control below AA is not a trade worth making for a
              visual effect. The state is carried by the left bar, the colour,
              and `aria-current` together. */}
          <ol className="mt-7">
            {labels.map((label, index) => {
              const isActive = index === activeIndex;

              return (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => scrollToIndex(index)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "block w-full border-t border-line py-2.5 pl-3 text-left text-sm",
                      "border-l-2 transition-colors duration-fast last:border-b",
                      isActive
                        ? "border-l-ink text-ink"
                        : "border-l-transparent text-ink-muted hover:text-ink",
                    )}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-8 lg:pt-2">
          {/* Progress bar. Decorative — the numeric counter to the left carries
              the same information as text, so nothing depends on the bar. */}
          <div aria-hidden="true" className="h-px w-full bg-line">
            <div
              className="h-px bg-ink transition-[width] duration-300"
              style={{
                width: `${((activeIndex + 1) / Math.max(itemCount, 1)) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <RailButton
              label="Previous project"
              disabled={!canScrollPrev}
              onClick={() => scrollToIndex(activeIndex - 1)}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </RailButton>

            <RailButton
              label="Next project"
              disabled={!canScrollNext}
              onClick={() => scrollToIndex(activeIndex + 1)}
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </RailButton>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RailButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}

/**
 * Rail control.
 *
 * `aria-disabled` is used instead of the `disabled` attribute so the button
 * stays in the tab order and remains focusable — a control that vanishes from
 * the tab sequence as you reach the end of a list is disorienting for keyboard
 * and screen reader users.
 */
function RailButton({ label, disabled, onClick, children }: RailButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) onClick();
      }}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-none border",
        "transition-colors duration-fast",
        disabled
          ? "cursor-not-allowed border-line text-ink-muted"
          : "border-line-strong text-ink hover:border-ink hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}
