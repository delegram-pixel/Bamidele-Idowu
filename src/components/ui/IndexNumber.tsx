import { cn } from "@/lib/utils/cn";

interface IndexNumberProps {
  value: number;
  /** Renders as `01 / 03` when supplied. */
  total?: number;
  /**
   * What the number means, for assistive technology. The numeral itself is
   * always `aria-hidden`: a screen reader announcing "zero one slash zero
   * three" is noise, where "Project 1 of 3" is information.
   *
   * Omit it where the numeral is purely decorative — section ordinals, where
   * the heading already carries the meaning and the number adds nothing a
   * non-sighted visitor needs.
   */
  label?: string;
  tone?: "light" | "invert";
  className?: string;
}

/**
 * The oversized display numeral.
 *
 * Set in the display serif rather than the monospace face used for every other
 * figure on the site. At this size the serif's stroke contrast is the point —
 * it is the loudest typographic element on the page and it is what makes the
 * section read as a catalogue plate instead of a dashboard tile.
 */
export function IndexNumber({
  value,
  total,
  label,
  tone = "light",
  className,
}: IndexNumberProps) {
  const isInvert = tone === "invert";

  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display tabular-nums leading-[0.78]",
        // Tighter than the base heading tracking: at display sizes the default
        // spacing opens up and the numeral stops reading as one mark.
        "tracking-[-0.03em]",
        className,
      )}
    >
      <span aria-hidden="true">
        {String(value).padStart(2, "0")}
        {total !== undefined ? (
          <span className={isInvert ? "text-invert-ink-muted" : "text-ink-faint"}>
            {"/"}
            {String(total).padStart(2, "0")}
          </span>
        ) : null}
      </span>

      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
