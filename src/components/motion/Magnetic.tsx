"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useCallback, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** Maximum travel in pixels toward the pointer. */
  strength?: number;
}

/**
 * Pointer attraction for buttons (TRD section 6, design-brief section 14).
 *
 * The interaction is a progressive enhancement layered on top of a normal
 * button, never a replacement for one:
 *
 *  - The child stays a real `<a>` or `<button>` with its own focus ring, so
 *    keyboard activation is untouched and the effect is purely visual.
 *  - The wrapper is CSS-gated to `(hover: hover) and (pointer: fine)`, so touch
 *    devices never see a hover-dependent behaviour.
 *  - Under reduced motion it renders as a plain wrapper with no transform.
 *
 * Movement is applied through Framer Motion values with a spring, so the button
 * eases toward the pointer rather than tracking it exactly — which is what makes
 * it feel considered rather than twitchy.
 */
export function Magnetic({ children, className, strength = 8 }: MagneticProps) {
  const prefersReducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 240, damping: 18, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 240, damping: 18, mass: 0.4 });

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Ignore pens, touch, and anything that is not a precise hovering pointer.
      if (event.pointerType !== "mouse") return;

      const bounds = wrapperRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;

      rawX.set(relativeX * strength * 2);
      rawY.set(relativeY * strength * 2);
    },
    [rawX, rawY, strength],
  );

  const handlePointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  if (prefersReducedMotion) {
    return <div className={cn("inline-flex", className)}>{children}</div>;
  }

  return (
    <div
      ref={wrapperRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      // No media query here on purpose: `handlePointerMove` already ignores any
      // pointer that is not a mouse, so touch devices never trigger the effect.
      className={cn("inline-flex", className)}
    >
      <motion.div style={{ x, y }} className="inline-flex">
        {children}
      </motion.div>
    </div>
  );
}
