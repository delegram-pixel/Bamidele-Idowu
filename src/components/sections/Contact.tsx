import { Calendar, Mail, MessageCircle } from "lucide-react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SECTION_IDS } from "@/data/nav";
import { siteConfig } from "@/data/site-config";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { isUnresolved } from "@/lib/utils/placeholder";
import { mailtoUrl, whatsappUrl } from "@/lib/utils/url";

/**
 * Contact section (PRD section 7.7, app-flow sections 9 and 10).
 *
 * Carries the form plus the direct alternatives the spec requires for visitors
 * who would rather not use a form. Each alternative is optional in config:
 * a channel is only rendered when it is actually configured and its URL passes
 * the safety check, so there are never dead links.
 */
export function Contact() {
  const { contactEmail, whatsappUrl: configuredWhatsApp, bookingUrl, name } = siteConfig;

  // A placeholder email is not a real destination, so the link is withheld
  // rather than rendered broken. The content validator already fails the build
  // in this state; this keeps the component honest in isolation too.
  const hasEmail = !isUnresolved(contactEmail) && contactEmail.includes("@");
  const waUrl = whatsappUrl(
    configuredWhatsApp,
    `Hi ${name}, I found your portfolio and would like to talk about a project.`,
  );

  // One class string for all three channels, so a channel can never drift into
  // a slightly different treatment from its siblings.
  const channelClassName =
    "group flex items-center gap-3 rounded-none border border-line-strong bg-plate px-5 py-4 " +
    "transition-colors duration-fast hover:border-ink hover:bg-surface";

  return (
    <Section id={SECTION_IDS.contact} ariaLabel="Contact">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeading
                eyebrow="Contact"
                title="Tell me what you are building"
                description="Describe the project in your own words. If it is a fit, I will come back with questions and an outline of what it would take. If it is not, I will say so."
              />
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 flex flex-col gap-3">
                <p className="label-meta text-ink-muted">Or reach me directly</p>

                {hasEmail ? (
                  <TrackedLink
                    href={mailtoUrl(contactEmail, "Project enquiry")}
                    event={ANALYTICS_EVENTS.emailClick}
                    className={channelClassName}
                  >
                    <Mail aria-hidden="true" className="size-4 shrink-0 text-ink" />
                    <span className="font-mono text-sm text-ink">{contactEmail}</span>
                  </TrackedLink>
                ) : null}

                {waUrl ? (
                  <TrackedLink
                    href={waUrl}
                    event={ANALYTICS_EVENTS.whatsappClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={channelClassName}
                  >
                    <MessageCircle aria-hidden="true" className="size-4 shrink-0 text-ink" />
                    <span className="text-sm text-ink">Message on WhatsApp</span>
                  </TrackedLink>
                ) : null}

                {bookingUrl ? (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={channelClassName}
                  >
                    <Calendar aria-hidden="true" className="size-4 shrink-0 text-ink" />
                    <span className="text-sm text-ink">Book a call</span>
                  </a>
                ) : null}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              {/* The form sits on the brightest surface on the page. It is the
                  one place a visitor has to do work, so it gets the most
                  contrast against the canvas and the hardest edge. */}
              <div className="rounded-plate border border-line-strong bg-plate p-6 shadow-plate sm:p-8 lg:p-10">
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
