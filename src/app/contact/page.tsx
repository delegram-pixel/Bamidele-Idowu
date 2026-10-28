import type { Metadata, Viewport } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { ContactHero } from "@/components/contact/ContactHero";
import { Rule } from "@/components/ui/Rule";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Let's Talk",
  description:
    "Start a project with Bamidele Idowu — a software engineer and instructor building MVPs, business websites, and digital products.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Let's Talk — Bamidele Idowu",
    description:
      "Want to start a new project? Tell me what you are building, or just say hello.",
    url: "/contact",
    type: "website",
  },
};

// The splash is a full claret sheet, so the browser chrome should match it
// rather than sitting on the blush colour the rest of the site uses.
export const viewport: Viewport = {
  themeColor: "#7F1734",
};

/**
 * Dedicated contact page.
 *
 * Two beats, same as the reference: a full-viewport claret invitation, then a
 * blush sheet carrying the actual form for visitors who want to give detail
 * rather than open their mail client. The homepage keeps its own compact
 * contact section, so nobody is forced through the splash to send an enquiry.
 */
export default function ContactPage() {
  return (
    <>
      <ContactHero />

      <section
        id="write"
        aria-labelledby="write-heading"
        className="bg-canvas text-ink py-20 sm:py-28"
      >
        <div className="mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12 xl:px-16">
          <Rule label="The details" />

          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 id="write-heading" className="text-display-sm leading-[0.98]">
                Tell me what <em className="italic">you&apos;re</em> building.
              </h2>

              <p className="text-ink-muted mt-6 max-w-md text-base leading-relaxed sm:text-lg">
                A few lines is enough: what it is, who it is for, and when you would like
                it live. I read every enquiry myself.
              </p>

              <dl className="border-line mt-10 flex flex-col gap-5 border-t pt-6">
                <div>
                  <dt className="label-meta text-ink-muted">Response time</dt>
                  <dd className="text-ink mt-2 text-sm">
                    Usually within two working days.
                  </dd>
                </div>

                <div>
                  <dt className="label-meta text-ink-muted">Based in</dt>
                  <dd className="text-ink mt-2 text-sm">{siteConfig.locationLabel}</dd>
                </div>

                <div>
                  <dt className="label-meta text-ink-muted">No fit?</dt>
                  <dd className="text-ink-muted mt-2 text-sm">
                    I will say so plainly, and point you somewhere better if I know a
                    place.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-8">
              {/* The brightest plate on the page: this is the one place a
                  visitor has to do work, so it gets the hardest edge. */}
              <div className="rounded-plate border-line-strong bg-plate shadow-plate border p-6 sm:p-8 lg:p-10">
                <ContactForm />
              </div>

              <p className="label-meta text-ink-muted mt-5">
                Your details are used only to reply to this enquiry.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
