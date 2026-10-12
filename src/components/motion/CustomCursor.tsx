"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Subtle custom cursor for desktop (design-brief section 15).
 *
 * The design brief is explicit that a custom cursor must never replace the
 * normal one or be required for navigation. So this draws an additional ring
 * that trails the real pointer and changes state over interactive elements —
 * `cursor: auto` is never touched, and the ring is `pointer-events-none` so it
 * cannot intercept a click.
 *
 * Disabled when:
 *  - the pointer is not a precise hovering device (touch, stylus);
 *  - `prefers-reduced-motion` is set;
 *  - the visitor has switched on a reduced-transparency preference.
 *
 * It also does nothing until the first real pointer move, so a keyboard-only
 * visitor never sees it.
 */
export function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  const ringRef = useRef<HTMLDivElement>(null);
  // Target position, updated by the pointer. The ring eases toward it in a
  // rAF loop so the trailing motion does not depend on pointer event frequency.
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  // Decide once whether this device should get the effect at all.
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (typeof window === "undefined") return;

    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)");

    const update = () => setIsEnabled(precisePointer.matches && !reducedTransparency.matches);
    update();

    precisePointer.addEventListener("change", update);
    reducedTransparency.addEventListener("change", update);

    return () => {
      precisePointer.removeEventListener("change", update);
      reducedTransparency.removeEventListener("change", update);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isEnabled) return;

    const handlePointerMove = (event: PointerEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
      setIsVisible(true);

      // Grow the ring over anything clickable, using the event target rather
      // than hit-testing, so it stays cheap.
      const target = event.target as Element | null;
      setIsInteractive(
        Boolean(
          target?.closest("a, button, input, textarea, select, [role='button'], [data-cursor]"),
        ),
      );
    };

    const handlePointerLeave = () => setIsVisible(false);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [isEnabled]);

  // Ease the ring toward the pointer. Only transform is written, so this never
  // triggers layout or paint outside the compositor.
  useEffect(() => {
    if (!isEnabled) return;

    let frameId: number;

    const animate = () => {
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className={[
        // A square, matching the crisp-edge radius language everywhere else.
        "pointer-events-none fixed top-0 left-0 z-[60] rounded-none border",
        "transition-[width,height,opacity,background-color] duration-200",
        isVisible ? "opacity-100" : "opacity-0",
        // Claret reads against the blush canvas; the inset blush ring reads
        // against the claret sections. Carrying both means the cursor stays
        // visible over either tone without needing a third colour or a blend
        // mode — a blend mode would have shifted the hue unpredictably over
        // the inverted panels.
        "ring-1 ring-inset ring-canvas/50",
        isInteractive ? "size-10 border-ink bg-ink/10" : "size-5 border-ink/60 bg-transparent",
      ].join(" ")}
    />
  );
}
