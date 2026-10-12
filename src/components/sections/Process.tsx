import { Reveal } from "@/components/motion/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SECTION_IDS } from "@/data/nav";
import { processSteps } from "@/data/process";

/**
 * Process (PRD section 7.5, app-flow section 7).
 *
 * A simple numbered progression, written for a non-technical reader. No claims
 * about guaranteed timelines or outcomes — the copy describes what happens, not
 * what it achieves.
 *
 * The steps are laid out on a single-pixel grid (`gap-px` over a `bg-line`
 * container) so the dividers are the background showing through. That keeps the
 * hairlines crisp at any zoom level, which a border-based approach does not.
 * On the blush canvas the cells are `bg-canvas`, so the same trick reads as a
 * printed four-panel plate.
 */
export function Process() {
  return (
    <Section id={SECTION_IDS.process} ariaLabel="How we work together">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow="Process"
            title="How we work together"
            description="Four stages, the same on every project. You always know which one we are in and what happens next."
          />
        </Reveal>

        <ol className="mt-16 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <li key={step.number} className="bg-canvas">
              <Reveal delay={index * 0.06} className="h-full">
                <div className="flex h-full flex-col gap-4 p-7 lg:p-8">
                  {/* The step number is the card's only large mark, so it is set
                      in the display serif rather than as a small monospace
                      label. No `font-semibold` — the face has one weight. */}
                  <span className="font-display text-4xl leading-none text-ink tabular-nums">
                    {step.number}
                  </span>
                  <h3 className="text-lg text-ink">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{step.description}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
