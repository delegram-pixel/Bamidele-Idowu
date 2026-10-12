import { cn } from "@/lib/utils/cn";
import type { ProjectStatus } from "@/types";

/**
 * Project status labels.
 *
 * Status is never carried by colour alone (design-brief section 18): every
 * badge has a real text label, and the shaded fill only reinforces a
 * distinction the words already make. The text is also what a screen reader
 * reads, which is why the label is a string rather than a styled dot.
 *
 * With a single accent hue available, the badges differentiate by *fill
 * intensity* rather than by hue — solid claret for the strongest claim (live),
 * stepping down to a bare hairline for the weakest (archived). That ordering is
 * deliberate and intentional: a badge's visual weight should track how much it
 * is asserting.
 */
const STATUS_META: Record<ProjectStatus, { label: string; className: string }> = {
  live: {
    label: "Live",
    className: "border-ink bg-ink text-canvas",
  },
  "pre-launch": {
    label: "Pre-launch",
    className: "border-ink bg-transparent text-ink",
  },
  "in-progress": {
    label: "In progress",
    className: "border-line-strong bg-surface text-ink",
  },
  prototype: {
    label: "Prototype",
    className: "border-line-strong bg-transparent text-ink-muted",
  },
  archived: {
    label: "Archived",
    className: "border-line bg-transparent text-ink-muted",
  },
};

interface StatusBadgeProps {
  status: ProjectStatus;
  tone?: "light" | "invert";
  className?: string;
}

export function StatusBadge({ status, tone = "light", className }: StatusBadgeProps) {
  const meta = STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none border px-2 py-1",
        "label-meta",
        // On a claret panel the whole fill scale collapses to a single hairline
        // treatment: there is no fill lighter than the panel to step *up* to, and
        // blush-on-claret is already 9.18:1, so the text label carries the status
        // on its own. Nothing currently renders a badge on an inverted panel —
        // this branch exists so that if one does, it is legible rather than
        // claret-on-claret.
        tone === "invert" ? "border-invert-line text-invert-ink" : meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
