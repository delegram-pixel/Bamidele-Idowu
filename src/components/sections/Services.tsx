import { Check } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { ServiceCta } from "@/components/sections/ServiceCta";
import { IndexNumber } from "@/components/ui/IndexNumber";
import { MetaRow, MetaTable } from "@/components/ui/MetaTable";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SECTION_IDS } from "@/data/nav";
import { services } from "@/data/services";

/**
 * Services (PRD section 7.2, design-brief section 10).
 *
 * Each service answers the three questions the PRD requires — who it is for,
 * what is delivered, what changes as a result — and ends with a next step that
 * carries the right project type into the contact form.
 *
 * Layout is a typographic list, not a grid of cards: services are read
 * sequentially and have differing amounts of detail, so equal-height boxes would
 * waste space and imply a symmetry that is not there.
 *
 * This is the site's one inverted section. On a light-first page a solid claret
 * panel is the strongest emphasis available without introducing a third colour,
 * and putting it here gives the scroll a hard beat exactly where the page stops
 * describing the practice and starts describing what you can buy — which is the
 * "strong section transition" design-brief section 5 asks for.
 */
export function Services() {
  return (
    <Section id={SECTION_IDS.services} ariaLabel="Services" tone="invert">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            tone="invert"
            eyebrow="Services"
            title="What I can build for you"
            description="Four ways I work with clients. Each one starts with the same question: what needs to be true for this to be worth building?"
          />
        </Reveal>

        <ul className="mt-16 flex flex-col lg:mt-20">
          {services.map((service, index) => (
            <li key={service.slug} className="border-t border-invert-line last:border-b">
              <Reveal delay={index * 0.05}>
                <article className="grid gap-8 py-10 lg:grid-cols-12 lg:gap-10 lg:py-14">
                  <div className="lg:col-span-1">
                    {/* Decorative here: the heading below already names the
                        service, so the ordinal adds nothing for a screen
                        reader and is left out of the accessibility tree. */}
                    <IndexNumber value={index + 1} className="text-3xl text-invert-ink" />
                  </div>

                  <div className="lg:col-span-5">
                    <h3 className="text-3xl leading-tight text-invert-ink sm:text-4xl">
                      {service.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-invert-ink-muted">
                      {service.summary}
                    </p>

                    <MetaTable className="mt-8">
                      <MetaRow label="Ideal for" tone="invert">
                        {service.idealFor}
                      </MetaRow>
                    </MetaTable>
                  </div>

                  <div className="lg:col-span-4">
                    <h4 className="label-meta text-invert-ink-muted">What you get</h4>
                    <ul className="mt-4 flex flex-col gap-3">
                      {service.deliverables.map((deliverable) => (
                        <li key={deliverable} className="flex items-start gap-3">
                          <Check
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-invert-ink"
                          />
                          <span className="text-sm leading-relaxed text-invert-ink-muted">
                            {deliverable}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col items-start gap-6 lg:col-span-2">
                    <div>
                      <h4 className="label-meta text-invert-ink-muted">Outcome</h4>
                      <p className="mt-3 text-sm leading-relaxed text-invert-ink">
                        {service.outcome}
                      </p>
                    </div>

                    {service.pricingLabel ? (
                      <p className="label-meta leading-relaxed text-invert-ink-muted">
                        {service.pricingLabel}
                      </p>
                    ) : null}

                    <ServiceCta projectType={service.contactProjectType} tone="invert">
                      Discuss this
                    </ServiceCta>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
