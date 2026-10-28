"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SECTION_IDS } from "@/data/nav";
import { cn } from "@/lib/utils/cn";

/**
 * Track which section is currently in view for navigation highlighting.
 *
 * Uses a single IntersectionObserver over every section rather than a scroll
 * listener: no work happens on the main thread while scrolling, and the
 * observer only fires on actual boundary crossings.
 *
 * The root margin is asymmetric so a section becomes "active" once its top
 * passes the upper third of the viewport — which matches where a reader's
 * attention actually is, rather than flipping the highlight the moment a
 * section's first pixel appears.
 */
export function useActiveSection(): string | undefined {
  const [activeSection, setActiveSection] = useState<string | undefined>(undefined);

  useEffect(() => {
    const ids = Object.values(SECTION_IDS);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Among everything intersecting, the highest on the page wins, so the
        // highlight never flickers between two adjacent sections.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        const topmost = visible[0];
        if (topmost?.target.id) setActiveSection(topmost.target.id);
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return activeSection;
}

interface HeaderProps {
  /** Anchors and labels are supplied so the header holds no content of its own. */
  navItems: { label: string; href: string }[];
  name: string;
}

/**
 * Site header and primary navigation (design-brief section 7).
 *
 * ---------------------------------------------------------------------------
 * Two layouts, one implementation:
 *
 *  - **Below `xl`** — the original top bar: wordmark, inline links, and a
 *    disclosure menu on small screens.
 *  - **At `xl` and above** — a bordered nav box pinned to the left rail, with
 *    the links stacked as full-width lines. This is the reference's structure
 *    and it is adopted deliberately; see the note in `container-page` for how
 *    the content column makes room for it.
 *
 * Behaviour is identical in both and is carried over unchanged: `useActiveSection`
 * scroll-spy, `aria-expanded` / `aria-controls` on the toggle, Escape to close,
 * and a background scroll lock while the panel is open.
 * ---------------------------------------------------------------------------
 *
 * Every link is a real anchor, so it works without JavaScript and can be opened
 * in a new tab.
 */
export function Header({ navItems, name }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeSection = useActiveSection();
  const pathname = usePathname();

  // Returning focus to the toggle when the panel closes with Escape. Without
  // this, focus is on an element that the `hidden` attribute has just removed
  // from the accessibility tree, and the browser drops it to `<body>` — which
  // silently sends a keyboard user back to the top of the tab order.
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Swap in the blurred backdrop after the hero. A passive listener plus a
  // boolean guard means this does not re-render on every scroll event.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape closes the menu, and background scroll is locked while it is open.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  // The contact page is a full-bleed standalone sheet with its own masthead and
  // close control. The fixed rail and top bar would sit on top of the claret
  // field in claret text, so the chrome is removed rather than restyled.
  if (pathname === "/contact") return null;

  const getIsActive = (href: string) => activeSection === href.replace("#", "");

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* ---------------------------------------------------------------------
          Left rail, xl and above. Scrolls internally if it is ever taller than
          the viewport, so it can never hide its own lower links.
         --------------------------------------------------------------------- */}
      <div className="pointer-events-none fixed top-10 left-10 hidden xl:block">
        <nav
          aria-label="Primary"
          className="pointer-events-auto w-56 max-h-[calc(100vh-5rem)] overflow-y-auto border border-line-strong bg-canvas/92 backdrop-blur-sm"
        >
          <a
            href={`#${SECTION_IDS.hero}`}
            className="block border-b border-line px-5 py-4 font-display text-lg text-ink"
          >
            {name}
          </a>

          <ul>
            {navItems.map((item) => {
              const isActive = getIsActive(item.href);

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "label-meta block border-b border-line px-5 py-3.5 transition-colors duration-fast",
                      isActive
                        ? "bg-ink text-canvas"
                        : "text-ink-muted hover:bg-surface hover:text-ink",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <Link
            href="/contact"
            className="label-meta block bg-accent-deep px-5 py-4 text-center text-canvas transition-colors duration-fast hover:bg-ink"
          >
            Start a Project
          </Link>
        </nav>
      </div>

      {/* ---------------------------------------------------------------------
          Top bar, below xl.
         --------------------------------------------------------------------- */}
      <div
        className={cn(
          "transition-colors duration-300 xl:hidden",
          isScrolled || isMenuOpen
            ? "border-b border-line bg-canvas/92 backdrop-blur-md"
            : "border-b border-transparent",
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-18">
          <a
            href={`#${SECTION_IDS.hero}`}
            className="font-display text-lg text-ink"
            // Returning to the top is the expected result of activating the
            // wordmark, so the panel is closed explicitly.
            onClick={() => setIsMenuOpen(false)}
          >
            {name}
          </a>

          {/* Inline navigation, md to xl. */}
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = getIsActive(item.href);

                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "relative block px-3.5 py-2 text-sm transition-colors duration-fast",
                        isActive ? "text-ink" : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {item.label}
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-3.5 -bottom-0.5 h-px bg-ink"
                        />
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className="hidden bg-accent-deep px-5 py-2.5 text-sm font-medium text-canvas transition-colors duration-fast hover:bg-ink sm:inline-flex"
            >
              Start a Project
            </Link>

            {/* Disclosure toggle */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex size-10 items-center justify-center border border-line-strong text-ink md:hidden"
            >
              <span aria-hidden="true" className="relative block h-3 w-4">
                <span
                  className={cn(
                    "absolute inset-x-0 block h-px bg-current transition-transform duration-200",
                    isMenuOpen ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-x-0 top-1.5 block h-px bg-current transition-opacity duration-200",
                    isMenuOpen ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-x-0 block h-px bg-current transition-transform duration-200",
                    isMenuOpen ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Disclosure panel */}
        <div
          id="mobile-nav"
          hidden={!isMenuOpen}
          className="border-t border-line bg-canvas md:hidden"
        >
          <nav aria-label="Primary mobile" className="container-page py-6">
            <ul className="flex flex-col">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block border-b border-line py-4 font-display text-2xl text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="mt-6 flex w-full items-center justify-center bg-accent-deep px-5 py-3 text-sm font-medium text-canvas"
            >
              Start a Project
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
