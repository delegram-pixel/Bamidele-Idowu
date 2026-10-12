import type { Metadata } from "next";
import Link from "next/link";

import { SECTION_IDS } from "@/data/nav";

export const metadata: Metadata = {
  title: "Page not found",
  // A 404 should never be indexed, and should not claim a canonical URL.
  robots: { index: false, follow: true },
};

/**
 * Not-found page (app-flow section 13).
 *
 * Reached by any unknown route, including an unknown project slug — which is
 * exactly the case a stale shared link produces. It always offers a way back
 * rather than leaving the visitor on a dead end.
 */
export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-heading"
      className="container-page flex min-h-[70dvh] flex-col justify-center py-32"
    >
      <p className="label-meta text-ink-muted">Error 404</p>

      <h1
        id="not-found-heading"
        className="mt-6 font-display text-display-sm leading-[0.95] text-ink"
      >
        That page does not exist
      </h1>

      <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-muted">
        The link may be out of date, or the project may no longer be published. The rest
        of the portfolio is still where you left it.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-none bg-accent-deep px-7 py-3.5 text-base font-medium text-canvas transition-colors duration-fast hover:bg-ink hover:shadow-plate"
        >
          Back to the portfolio
        </Link>

        <Link
          href={`/#${SECTION_IDS.work}`}
          className="inline-flex items-center justify-center rounded-none border border-line-strong px-7 py-3.5 text-base font-medium text-ink transition-colors duration-fast hover:border-ink hover:bg-surface"
        >
          See the work
        </Link>
      </div>
    </section>
  );
}
