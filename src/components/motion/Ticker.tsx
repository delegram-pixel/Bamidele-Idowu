"use client";

import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

interface TickerProps {
  items: string[];
  className?: string;
  /** Seconds for one full pass of the content. Slow by design. */
  durationSeconds?: number;
}

/**
 * Slow service ticker (design-brief section 14).
 *
 * Rendered as a hairline-bound band: the rules above and below are what make it
 * read as a printed strip running across the page rather than as a floating
 * marquee. The band is the only place on the site where content moves
 * continuously, and it is decorative repetition — every item in it also appears
 * in full in the services section.
 *
 * Implementation notes:
 *  - The animation is pure CSS (`@keyframes` in an inline style tag), so it runs
 *    without JavaScript and costs nothing on the main thread.
 *  - The list is rendered twice. The second copy is `aria-hidden`, so assistive
 *    technology encounters each service once rather than twice.
 *  - Under reduced motion the marquee is replaced by a static, wrapping row. It
 *    is the same information either way; it simply stops moving.
 *  - Edges are masked with a gradient so items do not appear to be sliced off.
 */
export function Ticker({ items, className, durationSeconds = 40 }: TickerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <ul
        className={cn(
          "flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-line py-4 label-meta text-ink-muted",
          className,
        )}
      >
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden border-y border-line py-4", className)}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      {/* Scoped keyframes. The name includes nothing dynamic, so a single
          definition serves every ticker on the page. */}
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>

      <div
        className="flex w-max"
        style={{
          animation: `ticker-scroll ${durationSeconds}s linear infinite`,
        }}
      >
        {/* Two identical copies translating -50% produce a seamless loop. */}
        <TickerRow items={items} />
        <TickerRow items={items} ariaHidden />
      </div>
    </div>
  );
}

function TickerRow({ items, ariaHidden }: { items: string[]; ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-10 pr-10 label-meta text-ink-muted"
    >
      {items.map((item) => (
        <li key={item} className="flex items-center gap-10 whitespace-nowrap">
          {item}
          <span aria-hidden="true" className="text-ink-faint">
            &#9670;
          </span>
        </li>
      ))}
    </ul>
  );
}
