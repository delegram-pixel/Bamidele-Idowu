import { Reveal } from "@/components/motion/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SECTION_IDS } from "@/data/nav";
import { pricingFallback, pricingItems } from "@/data/pricing";
import { formatCurrency } from "@/lib/utils/currency";

/**
 * Pricing (PRD section 7.6, app-flow section 8).
 *
 * No price has been confirmed, so this renders the transparent quotation
 * explanation instead of a number — which is exactly what the spec asks for
 * when figures are not settled ("do not publish fabricated prices").
 *
 * Three independent guards keep an invented price off the page:
 *  1. `pricingItems` only render when `visible` is true.
 *  2. A visible item must carry an amount and currency, or the content
 *     validator fails the build.
 *  3. When nothing is visible, the fallback explanation is the only thing
 *     rendered — there is no empty price table to look unfinished.
 */
export function Pricing() {
  const visiblePrices = pricingItems.filter(
    (item) => item.visible && item.amount !== undefined,
  );

  return (
    <Section id={SECTION_IDS.pricing} ariaLabel="Pricing">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title={visiblePrices.length > 0 ? "Starting points" : pricingFallback.heading}
            description={pricingFallback.explanation}
          />
        </Reveal>

        {visiblePrices.length > 0 ? (
          <ul className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {visiblePrices.map((item) => (
              <li key={item.serviceSlug} className="bg-canvas p-8">
                <p className="label-meta text-ink-muted">{item.label}</p>
                {/* The figure is set in the display serif, like every other
                    number that is the point of its block. `text-3xl` alone
                    would render it in the sans, because the serif is applied to
                    headings only. */}
                <p className="mt-4 flex items-baseline gap-2 font-display text-3xl text-ink">
                  {formatCurrency(item.amount ?? 0, item.currency ?? "GBP")}
                  <span className="font-sans text-sm text-ink-muted">from</span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        <Reveal delay={0.1}>
          {/* A white plate rather than a tinted panel: the fallback explanation
              is the section's real content, and lifting it onto `plate` gives it
              the weight of a card without adding a border-heavy box. */}
          <div className="mt-14 rounded-plate border border-line-strong bg-plate p-8 shadow-plate lg:p-10">
            <h3 className="label-meta text-ink">What affects the quote</h3>

            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {pricingFallback.factors.map((factor) => (
                <li key={factor} className="flex items-start gap-3">
                  {/* Square, not a bullet: a round dot would be the only soft
                      shape left in the system. */}
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-ink" />
                  <span className="text-sm leading-relaxed text-ink-muted">{factor}</span>
                </li>
              ))}
            </ul>

            <a
              href={`#${SECTION_IDS.contact}`}
              className="mt-8 inline-flex items-center gap-2 rounded-none bg-accent-deep px-6 py-3 text-sm font-medium text-canvas transition-[background-color,box-shadow] duration-fast hover:bg-ink hover:shadow-plate"
            >
              Request a quote
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
