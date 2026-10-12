import { AvailabilityIndicator } from "@/components/ui/AvailabilityIndicator";
import { Rule } from "@/components/ui/Rule";
import { SECTION_IDS } from "@/data/nav";
import { siteConfig } from "@/data/site-config";
import { isSafeExternalUrl, mailtoUrl } from "@/lib/utils/url";

/**
 * Site footer (PRD section 7.8, app-flow section 11).
 *
 * Contains social links, location, availability, and copyright. Social links are
 * filtered through `isSafeExternalUrl` and the list is empty until real profiles
 * are configured, in which case the column is omitted rather than rendered
 * empty. Every outbound link is marked `rel="noopener noreferrer"`.
 *
 * Set as a print colophon: an inverted claret panel, the name as a display
 * plate, and the small print on a rule at the bottom. It is the second and last
 * hard tonal beat in the scroll, which is what closes the page — the reference
 * uses the same device, and on a light-first palette it is the only way to end
 * on weight without introducing a third colour.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const { socialLinks, contactEmail, locationLabel, availability, name } = siteConfig;

  const safeSocialLinks = socialLinks.filter((link) => isSafeExternalUrl(link.url));

  // Inverted-section link treatment, declared once so the columns cannot drift.
  const linkClassName =
    "text-sm text-invert-ink-muted transition-colors duration-fast hover:text-invert-ink";

  return (
    <footer className="bg-accent-deep text-invert-ink">
      <div className="container-page py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl text-invert-ink">{name}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-invert-ink-muted">
              {siteConfig.headline}
            </p>

            <a
              href={mailtoUrl(contactEmail, "Project enquiry")}
              className="mt-5 inline-block font-mono text-sm text-invert-ink underline underline-offset-4 decoration-invert-line hover:decoration-invert-ink"
            >
              {contactEmail}
            </a>
          </div>

          <div>
            <h2 className="label-meta text-invert-ink-muted">Navigate</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                { label: "Work", href: `#${SECTION_IDS.work}` },
                { label: "Services", href: `#${SECTION_IDS.services}` },
                { label: "About", href: `#${SECTION_IDS.about}` },
                { label: "Process", href: `#${SECTION_IDS.process}` },
                { label: "Contact", href: `#${SECTION_IDS.contact}` },
              ].map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={linkClassName}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="label-meta text-invert-ink-muted">Based in</h2>
              <p className="mt-4 text-sm text-invert-ink">{locationLabel}</p>
            </div>

            <div>
              <h2 className="sr-only">Availability</h2>
              <AvailabilityIndicator availability={availability} tone="invert" />
            </div>

            {safeSocialLinks.length > 0 ? (
              <div>
                <h2 className="label-meta text-invert-ink-muted">Elsewhere</h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {safeSocialLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClassName}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <Rule tone="invert" className="mt-12" />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-meta text-invert-ink-muted">
            &copy; {year} {name}. All rights reserved.
          </p>
          {/* <p className="label-meta text-invert-ink-muted">
            Built with Next.js and Tailwind CSS.
          </p> */}
        </div>
      </div>
    </footer>
  );
}
