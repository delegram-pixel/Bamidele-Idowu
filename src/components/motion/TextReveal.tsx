"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface TextRevealProps {
  /**
   * Lines to animate. Author them as an explicit array so line breaks are a
   * deliberate typographic decision rather than whatever the viewport happens
   * to produce — which is also what stops oversized headlines clipping on
   * narrow screens.
   *
   * `ReactNode` rather than `string` so a line can carry markup. The one use is
   * the italic word in the hero: Instrument Serif's italic is where the face has
   * the most character, and mixing roman and italic within a display line is the
   * detail that separates editorial setting from a word-processor heading. It
   * costs nothing structurally — each line is already its own element.
   */
  lines: ReactNode[];
  className?: string;
  /** Seconds between each line settling into place. */
  stagger?: number;
  /** Render as an h1 on the hero, h2 elsewhere. */
  as?: "h1" | "h2" | "p";
}

/**
 * Hero headline reveal — lines rise and settle (design-brief section 6).
 *
 * Each line sits in an `overflow-hidden` box and slides up from below it, so the
 * text appears to emerge from behind a mask rather than fading in from nowhere.
 *
 * Accessibility notes:
 *  - The full text is in the DOM from the first paint and is not split into
 *    per-character spans, so screen readers read it as normal prose and search
 *    engines see complete sentences.
 *  - Under reduced motion, every line renders in place with no transform.
 */
export function TextReveal({ lines, className, stagger = 0.09, as = "h2" }: TextRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={cn("flex flex-col", className)}
      // The group announces itself once, as a heading, rather than line by line.
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: 0.1 } },
      }}
    >
      {lines.map((line, index) => (
        <span
          // Lines are static content in a fixed order, so the index is a stable
          // key and does not cause remounting.
          key={index}
          // The mask. `pb` gives descenders (g, y, p) room so they are not
          // clipped at rest.
          className="block overflow-hidden pb-[0.12em]"
        >
          <motion.span
            className="block"
            variants={{
              hidden: { y: "110%" },
              visible: {
                y: "0%",
                // Slower than the previous sans build. A high-contrast serif
                // looks rushed at tech-startup speeds — the thin strokes need
                // time to resolve before the next line starts.
                transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
