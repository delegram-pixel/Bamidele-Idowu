/**
 * "Let's talk" sign artwork for the contact page.
 *
 * Drawn as inline SVG rather than shipped as a raster so it stays crisp at any
 * size, costs one request fewer, and inherits the site's palette at full
 * contrast. The treatment is deliberately hand-drawn: a hard offset shadow,
 * slightly askew card, and linework that is a little too thick. That is what
 * makes a decorative object read as a paste-up rather than as an icon.
 *
 * Purely decorative — the page already says "Let's talk" in its heading, so the
 * whole drawing is `aria-hidden` and carries no meaning of its own.
 */
export function TalkCardArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 460 470"
      className={className}
      fill="none"
    >
      {/* Sparkles — printer's marks, not decoration for its own sake. */}
      <g fill="var(--color-canvas)" opacity="0.9">
        <path d="M52 70l4.5 13.5L70 88l-13.5 4.5L52 106l-4.5-13.5L34 88l13.5-4.5z" />
        <path d="M414 214l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" opacity="0.7" />
      </g>

      {/* Card. Offset block behind it is the shadow: no blur, so it reads as a
          second sheet of paper rather than as floating UI. */}
      <g transform="rotate(-8 230 158)">
        <rect
          x="88"
          y="68"
          width="304"
          height="180"
          rx="2"
          fill="var(--color-accent-deep)"
          opacity="0.65"
          transform="translate(10 12)"
        />
        <rect
          x="88"
          y="68"
          width="304"
          height="180"
          rx="2"
          fill="var(--color-canvas)"
          stroke="var(--color-accent-deep)"
          strokeWidth="7"
        />

        <text
          x="240"
          y="158"
          textAnchor="middle"
          fill="var(--color-ink)"
          fontFamily="var(--font-sans)"
          fontSize="48"
          fontWeight="900"
          letterSpacing="-1"
        >
          LET&apos;S TALK
        </text>

        {/* Smiley, drawn on the same baseline grid as the words. */}
        <g stroke="var(--color-ink)" strokeWidth="4.5" strokeLinecap="round">
          <circle cx="240" cy="196" r="17" />
          <path d="M232 201c2.5 4.5 5.5 6.5 8 6.5s5.5-2 8-6.5" />
          <circle cx="234" cy="191" r="2.4" fill="var(--color-ink)" stroke="none" />
          <circle cx="246" cy="191" r="2.4" fill="var(--color-ink)" stroke="none" />
        </g>
      </g>

      {/* Hand, back of the hand seen by the viewer, gripping the card from
          below. Layer order is card → thumb → fingers → palm, so the palm's top
          edge reads as a knuckle line and the fingertips stop just below the
          lettering instead of covering it. */}
      <g>
        {/* Thumb, hooked over the bottom-left corner of the card. Drawn before
            the palm so only the part gripping the card is visible; its base is
            covered by the hand rather than floating on top of it. */}
        <rect
          x="-20"
          y="-60"
          width="40"
          height="120"
          rx="20"
          fill="var(--color-surface)"
          stroke="var(--color-accent-deep)"
          strokeWidth="7"
          transform="translate(193 312) rotate(-15)"
        />

        {/* Fingers. Heights descend left to right to follow the card's tilt and
            to keep the hand from reading as four identical bars. */}
        <g fill="var(--color-surface)" stroke="var(--color-accent-deep)" strokeWidth="7">
          <rect
            x="201"
            y="216"
            width="41"
            height="152"
            rx="20.5"
            transform="rotate(-2 221.5 292)"
          />
          <rect x="245" y="230" width="41" height="138" rx="20.5" />
          <rect
            x="288"
            y="246"
            width="39"
            height="122"
            rx="19.5"
            transform="rotate(2 307.5 307)"
          />
          <rect
            x="328"
            y="262"
            width="35"
            height="106"
            rx="17.5"
            transform="rotate(6 345.5 315)"
          />
        </g>

        {/* Palm and wrist, in front of the finger bases. */}
        <path
          d="M230 470L208 410c-12-32 2-58 34-58h96c32 0 44 26 34 58l-14 60z"
          fill="var(--color-surface)"
          stroke="var(--color-accent-deep)"
          strokeWidth="7"
          strokeLinejoin="round"
        />

        {/* Two short knuckle ticks. A pair of symmetric curved lines plus a
            horizontal one below them read as a face at a glance, which is not
            what a hand should look like. */}
        <g
          stroke="var(--color-accent-deep)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        >
          <path d="M254 366l9 7" />
          <path d="M312 366l9 7" />
        </g>
      </g>
    </svg>
  );
}
