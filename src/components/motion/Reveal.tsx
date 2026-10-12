"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before starting. Used to stagger siblings. */
  delay?: number;
  /** Distance in pixels the element travels upward into place. */
  distance?: number;
  /** Fraction of the element that must be visible before it animates. */
  amount?: number;
}

/**
 * Scroll-triggered reveal used by every section.
 *
 * The animation is `once: true` — content settles and stays settled, so nothing
 * re-animates when a visitor scrolls back up, and nobody is forced to wait for a
 * transition to finish before reading (TRD section 6).
 *
 * Under reduced motion the element renders in its final state immediately. It is
 * the same markup either way, so no content depends on JavaScript having run.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 24,
  amount = 0.25,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
