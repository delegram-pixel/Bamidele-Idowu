import { cn } from "@/lib/utils/cn";
import type { Availability } from "@/types";

/**
 * Availability indicator (PRD FR-10).
 *
 * The status is rendered as text, not a coloured dot alone, so it survives
 * greyscale, colour blindness, and a screen reader (design-brief section 18).
 * The dot is decorative and hidden from assistive technology.
 *
 * The values come from `siteConfig.availability`, and the content validator
 * fails the build when `lastReviewed` goes stale — so the site cannot sit there
 * indefinitely claiming an availability nobody has confirmed.
 */
const STATUS_DOT: Record<Availability["status"], string> = {
  available: "bg-ink",
  limited: "bg-ink-faint",
  unavailable: "bg-line-strong",
};

const STATUS_DOT_INVERT: Record<Availability["status"], string> = {
  available: "bg-invert-ink",
  limited: "bg-invert-ink-muted",
  unavailable: "bg-invert-line",
};

interface AvailabilityIndicatorProps {
  availability: Availability;
  className?: string;
  /** Show the longer supporting sentence. Off in the compact footer. */
  withDetail?: boolean;
  tone?: "light" | "invert";
}

export function AvailabilityIndicator({
  availability,
  className,
  withDetail = false,
  tone = "light",
}: AvailabilityIndicatorProps) {
  const isInvert = tone === "invert";
  const dots = isInvert ? STATUS_DOT_INVERT : STATUS_DOT;

  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          // A square, not a circle. Every other mark on the site is now an
          // edge or a rule; a lone round dot would be the only soft shape left.
          "mt-1 size-1.5 shrink-0",
          dots[availability.status],
          // A gentle pulse draws the eye to the indicator. The global
          // reduced-motion rule collapses this to a single frame.
          availability.status === "available" && "animate-pulse",
        )}
      />

      <div className="flex flex-col gap-1">
        <span
          className={cn(
            "label-meta",
            isInvert ? "text-invert-ink" : "text-ink",
          )}
        >
          {availability.label}
        </span>
        {withDetail ? (
          <span
            className={cn(
              "text-sm leading-relaxed",
              isInvert ? "text-invert-ink-muted" : "text-ink-muted",
            )}
          >
            {availability.detail}
          </span>
        ) : null}
      </div>
    </div>
  );
}
