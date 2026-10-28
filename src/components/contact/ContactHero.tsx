import { ArrowDown, ArrowUpRight, Mail, X } from "lucide-react";
import Link from "next/link";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { TalkCardArt } from "@/components/contact/TalkCardArt";
import { LocalTime } from "@/components/ui/LocalTime";
import { siteConfig } from "@/data/site-config";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { isSafeExternalUrl, mailtoUrl } from "@/lib/utils/url";
import { isUnresolved } from "@/lib/utils/placeholder";

/**
 * The "Let's talk" splash.
 *
 * Structure follows the reference the client supplied: wordmark and close at the
 * top, an oversized invitation on the left, real contact routes on the right,
 * social links along the bottom. The palette and the printed-paper details are
 * the portfolio's own — a full-bleed claret sheet is the only place on the site
 * where the inverted tone can carry a whole viewport rather than a section.
 *
 * Nothing here is a dead end: the email address is a `mailto:` link, social
 * links are filtered for safe protocols, and the bottom of the page links to the
 * form for anyone who would rather write it down than open a mail client.
 */
export function ContactHero() {
  const { contactEmail, socialLinks, timeZone, locationLabel, name } = siteConfig;

  const hasEmail = !isUnresolved(contactEmail) && contactEmail.includes("@");
  const safeSocialLinks = socialLinks.filter((link) => isSafeExternalUrl(link.url));

  // One class for every social link so the row cannot drift out of alignment
  // one link at a time.
  const pillClassName =
    "inline-flex items-center gap-2 border border-invert-line px-4 py-2.5 text-sm " +
    "text-invert-ink transition-colors duration-fast hover:bg-canvas hover:text-ink";

  return (
    <section
      aria-label="Let's talk"
      className="bg-ink text-canvas relative flex min-h-dvh flex-col overflow-hidden"
    >
      {/* Registration grid, the same device the homepage hero uses. It gives the
          flat claret field a printed structure without adding another colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,240,245,0.075) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,240,245,0.075) 1px, transparent 1px)",
          backgroundSize: "10rem 10rem",
          maskImage: "radial-gradient(ellipse 90% 80% at 60% 40%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 60% 40%, black, transparent)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[96rem] flex-1 flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-12 xl:px-16">
        {/* Masthead ------------------------------------------------------- */}
        <div className="flex items-start justify-between gap-6">
          <Link
            href="/"
            className="text-canvas duration-fast font-sans text-base font-black tracking-tight uppercase transition-opacity hover:opacity-70 sm:text-lg"
          >
            {name}
          </Link>

          <Link
            href="/"
            aria-label="Close and return to the portfolio"
            className="border-invert-line text-invert-ink duration-fast hover:bg-canvas hover:text-ink inline-flex items-center gap-2 border px-4 py-2 text-sm transition-colors"
          >
            <X aria-hidden="true" className="size-4" />
            Close
          </Link>
        </div>

        {/* Invitation ----------------------------------------------------- */}
        <div className="grid flex-1 items-center gap-12 pt-12 pb-10 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pt-10">
          <div className="lg:col-span-7">
            <h1 className="text-canvas font-sans text-[clamp(3.25rem,10.5vw,8.75rem)] leading-[0.82] font-black tracking-[-0.045em] uppercase">
              <span className="block">Want to</span>
              <span className="block">start</span>
              <span className="block">a new</span>
              <span className="block">project?</span>
            </h1>

            <p className="font-display text-invert-ink-muted mt-7 text-[clamp(1.9rem,4.4vw,3.75rem)] leading-none italic">
              or just say hello!
            </p>
          </div>

          <div className="flex flex-col gap-10 lg:col-span-5 lg:gap-6">
            <div className="flex flex-col gap-8 lg:gap-6">
              <div>
                <p className="label-meta text-invert-ink-muted">Project enquiries</p>
                {hasEmail ? (
                  <TrackedLink
                    href={mailtoUrl(contactEmail, "Project enquiry")}
                    event={ANALYTICS_EVENTS.emailClick}
                    className="text-canvas decoration-invert-line duration-fast hover:decoration-canvas mt-2 inline-block max-w-full text-lg break-all underline underline-offset-[6px] transition-colors sm:text-2xl"
                  >
                    {contactEmail}
                  </TrackedLink>
                ) : null}
              </div>

              {safeSocialLinks.length > 0 ? (
                <div>
                  <p className="label-meta text-invert-ink-muted">Elsewhere</p>
                  <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                    {safeSocialLinks.map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group text-canvas duration-fast hover:text-invert-ink-muted inline-flex items-center gap-1.5 text-lg transition-colors"
                        >
                          {link.label}
                          <ArrowUpRight
                            aria-hidden="true"
                            className="duration-fast size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <p className="label-meta text-invert-ink-muted">Based in</p>
                <LocalTime
                  timeZone={timeZone}
                  locationLabel={locationLabel}
                  tone="invert"
                  className="mt-2 flex-wrap"
                />
                <p className="text-invert-ink-muted mt-2 text-sm">
                  Usually answered within two working days.
                </p>
              </div>
            </div>

            {/* Decorative, so it is last in the reading order and hidden from
                assistive technology inside the component itself. */}
            <div className="flex justify-end lg:mt-2">
              <TalkCardArt className="w-full max-w-[19rem] sm:max-w-[22rem] lg:max-w-[18rem] xl:max-w-[21rem] 2xl:max-w-[25rem] [@media(max-height:820px)]:max-w-[17rem]" />
            </div>
          </div>
        </div>

        {/* Bottom rail ---------------------------------------------------- */}
        <div className="border-invert-line flex flex-wrap items-center justify-between gap-4 border-t pt-5">
          <ul className="flex flex-wrap items-center gap-2">
            {safeSocialLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={pillClassName}
                >
                  {link.label}
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </a>
              </li>
            ))}

            {hasEmail ? (
              <li>
                <TrackedLink
                  href={mailtoUrl(contactEmail, "Project enquiry")}
                  event={ANALYTICS_EVENTS.emailClick}
                  className={pillClassName}
                >
                  <Mail aria-hidden="true" className="size-3.5" />
                  Email me
                </TrackedLink>
              </li>
            ) : null}
          </ul>

          <a
            href="#write"
            className="group text-invert-ink-muted duration-fast hover:text-canvas inline-flex items-center gap-2 text-sm transition-colors"
          >
            Or write it down
            <ArrowDown
              aria-hidden="true"
              className="duration-fast size-4 transition-transform group-hover:translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
