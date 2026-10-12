"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /**
   * Total travel in pixels across the full scroll pass. Deliberately small:
   * design-brief section 14 says "avoid excessive parallax", and large offsets
   * cause the image to move faster than the page, which reads as jitter on
   * mid-range phones.
   */
  distance?: number;
}

/**
 * Restrained parallax for project visuals (design-brief section 14).
 *
 * The effect is driven by scroll progress rather than a pointer or a scroll
 * listener, so it stays on the compositor thread and costs no layout work.
 *
 * Under reduced motion the wrapper renders a plain div. Note the element is
 * never moved via `top`/`margin` — only `transform` — so it cannot shift layout
 * or cause a cumulative layout shift (TRD section 12).
 */
export function Parallax({ children, className, distance = 40 }: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Begin as the element enters from the bottom, finish as it leaves the top.
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      <motion.div style={{ y }} className="size-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
