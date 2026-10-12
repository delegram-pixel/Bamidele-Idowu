import { cn } from "@/lib/utils/cn";

type Tone = "light" | "invert";

interface RuleProps {
  /** Short uppercase label pinned to the left of the line, interrupting it. */
  label?: string;
  /** Small item pinned to the right — a count, a date, an index. */
  trailing?: React.ReactNode;
  tone?: Tone;
  className?: string;
}

/**
 * A printed hairline with an optional caption sitting on it.
 *
 * ---------------------------------------------------------------------------
 * This is the connective tissue of the whole layout. The catalogue language
 * needs a way to separate rows and sections that reads as a *printed rule*
 * rather than as a UI divider, and a rule that carries its own caption — the
 * label interrupting the line — is what makes the metadata feel typeset instead
 * of merely styled.
 *
 * The line is `aria-hidden` because it is decoration: it conveys separation
 * visually and nothing at all to a screen reader, which already gets that
 * structure from the headings.
 * ---------------------------------------------------------------------------
 */
export function Rule({ label, trailing, tone = "light", className }: RuleProps) {
  const isInvert = tone === "invert";

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {label ? (
        <span
          className={cn(
            "label-meta shrink-0",
            isInvert ? "text-invert-ink-muted" : "text-ink-muted",
          )}
        >
          {label}
        </span>
      ) : null}

      <span
        aria-hidden="true"
        className={cn("h-px flex-1", isInvert ? "bg-invert-line" : "bg-line")}
      />

      {trailing ? (
        <span
          className={cn(
            "label-meta shrink-0",
            isInvert ? "text-invert-ink-muted" : "text-ink-muted",
          )}
        >
          {trailing}
        </span>
      ) : null}
    </div>
  );
}
