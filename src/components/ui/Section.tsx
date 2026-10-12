import type { ReactNode } from "react";

import { Rule } from "@/components/ui/Rule";
import { cn } from "@/lib/utils/cn";

type Tone = "light" | "invert";

interface SectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  /**
   * `light` is the default blush canvas; `invert` flips to a solid claret panel.
   *
   * This replaces the old `"dark" | "paper"` pair. Under the previous dark-first
   * palette the page was dark and `paper` was the relief section; on a
   * light-first canvas that relationship is inverted, so the names now describe
   * what the section *is* rather than how light it happens to be.
   */
  tone?: Tone;
  /** Accessible name for the landmark when the visible heading is not enough. */
  ariaLabel?: string;
}

/**
 * A page section with a landmark role and consistent vertical rhythm.
 *
 * Every section on the homepage is a `<section>` with an accessible name, which
 * is what lets screen reader users jump between them.
 *
 * Background and text colour are set together rather than separately, so a
 * section can never end up as claret text on a claret panel — the failure mode
 * that appears the moment someone adds a tone in one place and forgets the
 * other.
 */
export function Section({
  id,
  children,
  className,
  tone = "light",
  ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        "relative py-20 sm:py-28 lg:py-36",
        tone === "invert" ? "bg-accent-deep text-invert-ink" : "bg-canvas text-ink",
        className,
      )}
    >
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  /** Short uppercase label. Rendered sitting on a hairline rule. */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  /** Heading level. Defaults to 2 — h1 is reserved for the hero. */
  as?: "h2" | "h3";
  tone?: Tone;
}

/**
 * Section heading.
 *
 * Two changes from the previous version, both deliberate:
 *
 *  - The eyebrow is now a `Rule` with a label rather than a floating small
 *    label. The label interrupting a hairline is the catalogue's connective
 *    device and it does the same job here: it anchors the section to a
 *    printed grid instead of leaving small caps drifting above a headline.
 *
 *  - `font-semibold` is gone. Instrument Serif ships a single weight and
 *    `font-synthesis-weight: none` is set globally, so the class was inert —
 *    it implied a weight axis the typeface does not have. Hierarchy now comes
 *    from size and case, which is how the reference achieves it too.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  as: Heading = "h2",
  tone = "light",
}: SectionHeadingProps) {
  const isInvert = tone === "invert";

  return (
    <header className={cn("max-w-3xl", className)}>
      {eyebrow ? <Rule label={eyebrow} tone={tone} className="mb-8" /> : null}

      <Heading className="text-display-sm leading-[0.98]">{title}</Heading>

      {description ? (
        <div
          className={cn(
            "mt-6 max-w-2xl text-base leading-relaxed sm:text-lg",
            isInvert ? "text-invert-ink-muted" : "text-ink-muted",
          )}
        >
          {description}
        </div>
      ) : null}
    </header>
  );
}
