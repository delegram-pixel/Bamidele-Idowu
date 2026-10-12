"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Global motion configuration.
 *
 * `reducedMotion="user"` makes Framer Motion honour the operating system's
 * "reduce motion" setting automatically: transform and layout animations are
 * skipped while opacity changes are kept, which is the recommended behaviour
 * because a plain cross-fade still communicates that something changed without
 * moving anything.
 *
 * This is the site-wide baseline. Effects that must be disabled outright rather
 * than softened — parallax, the horizontal rail's pinning, the custom cursor —
 * check `useReducedMotion()` themselves and render a static alternative.
 *
 * `transition` sets the shared easing so independently authored animations feel
 * like one system (design-brief section 14).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionConfig>
  );
}
