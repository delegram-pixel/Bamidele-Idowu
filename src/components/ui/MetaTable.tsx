import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Deliberately no `tone` prop. Tone belongs on each `MetaRow`, because the rows
 * render their own `<dt>`/`<dd>` and those are what carry the colour — a tone
 * here would have to be threaded down to them anyway. It was briefly declared
 * and never read, which is the worst version of the prop: a caller on a claret
 * panel would have set it, seen no error, and shipped labels in claret on
 * claret. Leaving it off means the mismatch is a type error.
 */
interface MetaTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * A label/value metadata table.
 *
 * ---------------------------------------------------------------------------
 * Promoted out of `StatusBadge.tsx`, where it was living as `MetaItem` beside
 * code that had nothing to do with it. The shape is unchanged — a small
 * monospace key above or beside its value — because it was already right; it
 * simply now has a home and a name that says what it is.
 *
 * This is the reference's most reusable device and it appears in every section:
 * project role and stack, service deliverables, process timings, pricing terms.
 * Metadata set this way reads as a spec sheet, which is exactly the register
 * the catalogue aesthetic wants — it is confident without being salesy, and it
 * lets a non-technical client scan for the one fact they care about.
 *
 * Built on a real `<dl>`, so the label/value relationship exists in the
 * accessibility tree rather than only in the visual arrangement.
 * ---------------------------------------------------------------------------
 */
export function MetaTable({ children, className }: MetaTableProps) {
  return (
    <dl
      className={cn(
        // Single column on narrow screens; a fixed-width key column once there
        // is room, so the values align into a vertical edge the eye can follow.
        "grid gap-x-8 gap-y-5 sm:grid-cols-[8rem_1fr]",
        className,
      )}
    >
      {children}
    </dl>
  );
}

interface MetaRowProps {
  label: string;
  children: ReactNode;
  tone?: "light" | "invert";
  className?: string;
}

/**
 * One row of a `MetaTable`. Renders the `<dt>` and `<dd>` pair directly, so the
 * grid children are the terms and definitions themselves and the columns line
 * up without a wrapper element between them.
 */
export function MetaRow({ label, children, tone = "light", className }: MetaRowProps) {
  const isInvert = tone === "invert";

  return (
    <>
      <dt
        className={cn(
          "label-meta pt-0.5",
          isInvert ? "text-invert-ink-muted" : "text-ink-muted",
          className,
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "text-sm leading-relaxed",
          isInvert ? "text-invert-ink" : "text-ink",
        )}
      >
        {children}
      </dd>
    </>
  );
}
