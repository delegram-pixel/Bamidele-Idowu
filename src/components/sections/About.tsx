import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { FallbackArt } from "@/components/projects/FallbackArt";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SECTION_IDS } from "@/data/nav";

/**
 * About and teaching (PRD section 7.4, app-flow section 6, design-brief
 * section 11).
 *
 * Uses composed product imagery rather than requiring a personal portrait,
 * which the design brief asks for explicitly. The section stays short on
 * purpose — the brief warns against it turning into a résumé.
 *
 * This was the light relief section (`tone="paper"`) under the dark palette.
 * On a light-first page that role disappears — the whole page is now the cream
 * ground — so it renders on the canvas and Services becomes the single
 * inversion. One hard tonal beat in the scroll is a stronger gesture than two.
 */
export function About() {
  return (
    <Section id={SECTION_IDS.about} ariaLabel="About Bamidele">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <SectionHeading
                eyebrow="About"
                title="I build things, then explain how they work"
                description="I am a web developer and instructor based in Port Harcourt. I build MVPs, business websites, and digital products — and I teach JavaScript to people learning to do the same."
              />
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 flex max-w-2xl flex-col gap-5 text-base leading-relaxed text-ink-muted">
                <p>
                  My approach starts with the problem rather than the technology. Before
                  writing code I want to know who this is for and what changes for them
                  when it works. That usually shrinks the first version considerably,
                  which is a good thing — a smaller thing shipped beats a larger thing
                  described.
                </p>
                <p>
                  Teaching keeps the engineering honest. Explaining why a decision was
                  made forces me to have an actual reason for it, and the questions
                  learners ask are the same ones clients ask in different words. I write
                  code someone else can read, because someone else usually has to.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-none bg-accent-deep px-7 py-3.5 text-base font-medium text-canvas transition-[background-color,box-shadow] duration-fast hover:bg-ink hover:shadow-plate"
                >
                  Work with me
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={0.1}>
              {/* Two claret plates. They are the only large areas of solid
                  colour outside the Services panel, which is what keeps the
                  section from reading as an all-text column, and the offset
                  shadow is what makes them read as pasted paper rather than as
                  flat colour blocks. */}
              <div className="grid gap-6 sm:grid-cols-2">
                <FallbackArt
                  seed="about-teaching"
                  label="Teaching"
                  className="aspect-4/5 rounded-plate shadow-plate sm:mt-10"
                />
                <FallbackArt
                  seed="about-building"
                  label="Building"
                  className="aspect-4/5 rounded-plate shadow-plate"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
