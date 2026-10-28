import { ArrowDown } from "lucide-react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { TextReveal } from "@/components/motion/TextReveal";
import { Ticker } from "@/components/motion/Ticker";
import { AvailabilityIndicator } from "@/components/ui/AvailabilityIndicator";
import { LocalTime } from "@/components/ui/LocalTime";
import { Rule } from "@/components/ui/Rule";
import { SECTION_IDS } from "@/data/nav";
import { services } from "@/data/services";
import { siteConfig } from "@/data/site-config";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

/**
 * Hero (PRD section 7.1, design-brief section 6).
 *
 * This is a Server Component. The three interactive pieces inside it —
 * the headline reveal, the clock, and the tracked CTAs — are separate Client
 * Components, so the hero's text is server-rendered and present in the initial
 * HTML. That matters for LCP (the headline is the largest element) and for
 * search engines.
 *
 * The headline is authored as explicit lines rather than left to wrap. Line
 * breaks in oversized display type are a typographic decision, and letting the
 * browser choose them is how large headlines end up clipping or orphaning words
 * at 320px.
 *
 * ---------------------------------------------------------------------------
 * Recomposed for the light palette. What was here before — two blurred accent
 * glows and a light-on-dark technical grid — was doing the work that a dark
 * theme needs to stop a page reading as an empty black rectangle. On blush
 * paper that job does not exist, and leaving the glows in would have produced
 * exactly the pink-washed "gradient landing page" look the palette is meant to
 * avoid. The grid stays but flips to claret hairlines at low opacity, where it
 * reads as a printer's registration grid rather than as a futuristic HUD.
 * ---------------------------------------------------------------------------
 */
export function Hero() {
  const { description, availability, timeZone, locationLabel } = siteConfig;

  // The last line carries an italic word. Instrument Serif's italic is the most
  // characterful thing about the face, and a roman/italic mix inside a display
  // line is the single cheapest way to look typeset rather than styled.
  const headlineLines = [
    "I build web",
    "products people",
    <>
      <em className="italic">actually</em> use.
    </>,
  ];

  return (
    <section
      id={SECTION_IDS.hero}
      aria-label="Introduction"
      className="relative overflow-hidden pt-32 pb-16 sm:pt-40 lg:pt-44 lg:pb-24"
    >
      {/* Decorative background. Purely graphic and hidden from assistive tech —
          it carries no information and must never be the only thing conveying
          something. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(127,23,52,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(127,23,52,0.055) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse 85% 65% at 50% 0%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 65% at 50% 0%, black, transparent)",
          }}
        />
      </div>

      <div className="container-page">
        {/* Availability and local time sit above the headline: a visitor can see
            both without scrolling, which is what the PRD asks for. The rule
            below them turns the pair into a masthead rather than two stray
            widgets. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AvailabilityIndicator availability={availability} />
          <LocalTime timeZone={timeZone} locationLabel={locationLabel} />
        </div>

        <Rule className="mt-6" />

        <div className="mt-12 grid gap-14 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <TextReveal
              as="h1"
              lines={headlineLines}
              className="text-display leading-[0.92] text-ink"
            />

            {/* Visually the lines above are the headline; this is the same
                headline as one sentence for search engines and for anyone whose
                assistive technology reads the h1 as a string. It is not hidden
                — it is the descriptive subheading the design brief asks for. */}
            <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              {description}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <TrackedLink
                href="/contact"
                event={ANALYTICS_EVENTS.heroContactClick}
                className="inline-flex items-center justify-center rounded-none bg-accent-deep px-7 py-3.5 text-base font-medium text-canvas transition-[background-color,box-shadow] duration-fast hover:bg-ink hover:shadow-plate"
              >
                Start a Project
              </TrackedLink>

              <TrackedLink
                href={`#${SECTION_IDS.work}`}
                event={ANALYTICS_EVENTS.heroWorkClick}
                className="inline-flex items-center justify-center gap-2 rounded-none border border-line-strong px-7 py-3.5 text-base font-medium text-ink transition-[background-color,border-color] duration-fast hover:border-ink hover:bg-surface"
              >
                See My Work
                <ArrowDown aria-hidden="true" className="size-4" />
              </TrackedLink>
            </div>
          </div>

          {/* Layered graphic composition (design-brief section 6). Decorative,
              so it is hidden from assistive technology and collapses entirely on
              small screens rather than competing with the message. */}
          <div aria-hidden="true" className="hidden lg:col-span-5 lg:block">
            <HeroPlates />
          </div>
        </div>
      </div>

      {/* Service ticker bridging the hero and the services section
          (design-brief section 14). */}
      <div className="container-page mt-20 lg:mt-28">
        <Ticker items={services.map((service) => service.title)} />
      </div>
    </section>
  );
}

/**
 * A stack of index cards.
 *
 * The previous version was three translucent panels with a blurred drop shadow,
 * which only reads as depth against a dark background. These are opaque white
 * plates with hard offset shadows instead — they sit *on* the blush paper and
 * cast a printed block shadow, which is what makes the stack legible without
 * any glow to do the work.
 *
 * The visible card is set as a work index rather than a decorative panel: the
 * services listed are the real ones, so the graphic states something true about
 * the practice instead of being filler art.
 */
function HeroPlates() {
  return (
    <div className="relative mx-auto aspect-4/5 w-full max-w-sm">
      {/* Two cards peeking out behind, rotated further, so the stack reads as
          depth rather than as one card with an oversized shadow. */}
      <div className="absolute inset-0 translate-x-5 translate-y-7 -rotate-[7deg] rounded-plate border border-line bg-plate" />
      <div className="absolute inset-0 translate-x-2 translate-y-3 rotate-[3deg] rounded-plate border border-line bg-plate" />

      <div className="absolute inset-0 flex -rotate-[1deg] flex-col rounded-plate border border-line-strong bg-plate p-7 shadow-plate-lift">
        <div className="label-meta flex items-center justify-between text-ink-muted">
          {/* The card lists services, so it says so. Labelling it "Selected
              work" over a list of services would be a category error, and a
              hardcoded count would be a claim about the portfolio that this
              component has no way to keep true. */}
          <span>Services</span>
          <span className="text-ink">
            {String(services.length).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-6 flex flex-1 flex-col justify-center">
          {services.map((service) => (
            <div key={service.slug} className="border-t border-line py-3.5 last:border-b">
              <span className="font-display text-lg leading-none text-ink">
                {service.title}
              </span>
            </div>
          ))}
        </div>

        <Rule className="mt-6" />

        {/* Real values only. The plate is decorative, but a decorative element
            that states a plausible-looking falsehood is still a falsehood —
            and a founding year is exactly the sort of detail a visitor would
            read and believe. */}
        <div className="label-meta mt-4 flex items-center justify-between text-ink-muted">
          <span>{siteConfig.locationLabel}</span>
          <span>{siteConfig.availability.label}</span>
        </div>
      </div>
    </div>
  );
}
