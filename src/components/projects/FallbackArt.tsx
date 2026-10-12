import { cn } from "@/lib/utils/cn";

interface FallbackArtProps {
  /** Stable seed — the project slug — so the art never changes between renders. */
  seed: string;
  /** Short label rendered into the composition, usually the project title. */
  label: string;
  className?: string;
}

/**
 * Generated fallback artwork for projects without an approved screenshot.
 *
 * Why this exists: the spec requires genuine, approved screenshots and forbids
 * inventing them (PRD section 8), while also requiring that a missing image
 * does not break the layout (app-flow section 13). A neutral geometric plate
 * satisfies both — it looks deliberate, holds the composition, and claims
 * nothing about a product it is not showing.
 *
 * ---------------------------------------------------------------------------
 * Rebuilt for the catalogue palette. The previous version was a dark gradient
 * with a technical grid and glowing accent squares — a "dark tech product"
 * composition that has no equivalent on a pale background. This one is a
 * printed plate instead: a solid claret block carrying blush geometry, in the
 * same two-colour duotone discipline as the rest of the site.
 *
 * Colours come from Tailwind's `fill-*` / `stroke-*` utilities against the
 * theme tokens rather than the previous hardcoded hexes, so the plate follows a
 * palette change automatically instead of being the one component that has to
 * be found and edited by hand. That was the actual bug here: six literal colour
 * values buried in SVG attributes, invisible to any search for class names.
 *
 * Rendered as inline SVG so it costs no network request and cannot 404.
 * It is decorative: `aria-hidden` is set and the surrounding markup carries the
 * real information, so nothing here is announced twice.
 * ---------------------------------------------------------------------------
 */
export function FallbackArt({ seed, label, className }: FallbackArtProps) {
  const hash = hashString(seed);

  // Each derived value is taken from a different part of the hash so the
  // variation is genuinely independent — pulling rotation and radius from the
  // same low bits produced visibly correlated compositions.
  const angle = hash % 360;
  const spread = (hash >> 3) % 24;
  const variant = (hash >> 9) % 3;

  const radius = 168 + spread * 3;
  const centreX = 320 + ((hash >> 5) % 160);
  const centreY = 240 + ((hash >> 7) % 120);

  // The solid quadrant swaps corners per seed. It is the composition's anchor,
  // so moving it changes the plate's whole balance rather than just its detail.
  const quadrant = [
    `M 800 600 L ${800 - 300 - spread * 4} 600 A ${300 + spread * 4} ${300 + spread * 4} 0 0 1 800 ${600 - 300 - spread * 4} Z`,
    `M 0 0 L ${260 + spread * 4} 0 A ${260 + spread * 4} ${260 + spread * 4} 0 0 1 0 ${260 + spread * 4} Z`,
    `M 800 0 L 800 ${300 + spread * 4} A ${300 + spread * 4} ${300 + spread * 4} 0 0 1 ${800 - 300 - spread * 4} 0 Z`,
  ][variant];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative isolate flex items-end justify-start overflow-hidden bg-accent-deep",
        className,
      )}
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <defs>
          {/* Hatched band, rotated per seed. A printed fill rather than a glow. */}
          <pattern
            id={`hatch-${seed}`}
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${angle})`}
          >
            <path d="M0 0V12" className="stroke-canvas" strokeOpacity="0.16" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="800" height="600" className="fill-accent-deep" />

        {/* Concentric rings, off-centre and seeded. Wide strokes at low opacity
            read as ink on paper rather than as UI chrome. */}
        <g transform={`translate(${centreX} ${centreY})`}>
          <circle
            r={radius}
            fill="none"
            className="stroke-canvas"
            strokeOpacity="0.3"
            strokeWidth="1.5"
          />
          <circle
            r={radius * 0.66}
            fill="none"
            className="stroke-canvas"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          <circle r={radius * 0.34} className="fill-canvas" fillOpacity="0.9" />
        </g>

        {/* Hatched band across the lower third. */}
        <rect y="400" width="800" height="200" fill={`url(#hatch-${seed})`} />

        {/* Solid quadrant — the compositional anchor. */}
        <path d={quadrant} className="fill-canvas" fillOpacity="0.92" />

        {/* Hairlines riding the same angle as the hatch, tying the plate together. */}
        <g transform={`rotate(${angle * 0.35} 400 300)`}>
          <line
            x1="0"
            y1="300"
            x2="800"
            y2="300"
            className="stroke-canvas"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        </g>
      </svg>

      <div className="relative z-10 flex flex-col gap-2 p-6 sm:p-8">
        <span className="label-meta text-invert-ink-muted">Case study</span>
        {/* No `font-semibold`: Instrument Serif has one weight. */}
        <span className="font-display text-xl leading-none text-invert-ink sm:text-2xl">
          {label}
        </span>
      </div>
    </div>
  );
}

/** Deterministic 32-bit string hash. Not cryptographic — only seeds visuals. */
function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}
