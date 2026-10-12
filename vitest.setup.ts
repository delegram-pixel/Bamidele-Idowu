import "@testing-library/jest-dom/vitest";

/**
 * Global test setup.
 *
 * jsdom does not implement `matchMedia`, which Framer Motion's
 * `useReducedMotion` and several components query. Tests that need to assert
 * reduced-motion behaviour override this stub per-test.
 */
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
