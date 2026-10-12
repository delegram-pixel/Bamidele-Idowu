import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";
import { ContactPrefillProvider } from "@/components/contact/ContactPrefillContext";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PersistentCta } from "@/components/layout/PersistentCta";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { navItems } from "@/data/nav";
import { getSiteUrl, siteConfig } from "@/data/site-config";

import "@/styles/globals.css";

/**
 * Body and technical-label fonts load through `next/font/google`, which
 * self-hosts the files at build time. That removes the render-blocking request
 * to a third-party font CDN, which is both a performance win (TRD section 12)
 * and a privacy one — no visitor IP is disclosed to Google by a font request.
 *
 * `display: "swap"` shows fallback text immediately rather than invisible text,
 * protecting the largest-contentful-paint measurement.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

/**
 * Display face for headlines and project titles.
 *
 * DELIBERATE DEVIATION FROM design-brief.md SECTION 4, which specifies Clash
 * Display. Clash Display ships from Fontshare under a paid licence and was never
 * supplied, so headlines were silently falling back to Inter — the site had no
 * display face at all.
 *
 * Instrument Serif is on Google Fonts, so `next/font` self-hosts it at build
 * time: no third-party request, no licence to buy, and no missing-file state
 * that leaves the repository unbuildable. Its high stroke contrast is also what
 * makes a claret-on-blush palette read as editorial rather than as a pink site.
 *
 * It ships a single weight (400), so nothing in the codebase sets a font-weight
 * on display text — see the note in `src/styles/globals.css`. The italic is
 * loaded because display lines use it for emphasis.
 */
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  // Makes every relative URL in metadata resolve absolutely.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} — Web Developer and Instructor`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  keywords: [
    "web developer",
    "freelance developer",
    "Next.js developer",
    "MVP development",
    "JavaScript instructor",
    "Port Harcourt",
    "Nigeria",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Web Developer and Instructor`,
    description: siteConfig.description,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Web Developer and Instructor`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  formatDetection: {
    // Stops iOS turning the email address into an unstyled call/text link.
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches --color-canvas. Colors the browser chrome on mobile so the page does
  // not sit under a dark bar it no longer relates to.
  themeColor: "#FFF0F5",
  colorScheme: "light",
};

/**
 * Structured data (TRD section 11).
 *
 * Only verifiable facts are published: name, role, location, and the canonical
 * URL. There is deliberately no `sameAs`, no credentials, and no aggregate
 * rating — the spec forbids structured-data claims that cannot be verified, and
 * inventing them is both dishonest and a manual-action risk.
 */
function StructuredData() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: "Web Developer and Instructor",
    description: siteConfig.description,
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Port Harcourt",
      addressCountry: "NG",
    },
    ...(siteConfig.socialLinks.length > 0
      ? { sameAs: siteConfig.socialLinks.map((link) => link.url) }
      : {}),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
  };

  return (
    <script
      type="application/ld+json"
      // Content is built from typed local config, never visitor input, so there
      // is no untrusted string being embedded here.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([person, website]),
      }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <StructuredData />
      </head>
      <body className="min-h-dvh antialiased">
        {/* First focusable element on the page, so keyboard users can skip the
            navigation instead of tabbing through it on every visit. */}
        <a href="#main" className="sr-only-focusable">
          Skip to main content
        </a>

        {/* MotionProvider applies the reduced-motion policy to every animation
            beneath it (see components/motion/MotionProvider.tsx). */}
        <MotionProvider>
          <ContactPrefillProvider>
            <Header navItems={navItems} name={siteConfig.name} />

            <main id="main">{children}</main>

            <Footer />
            <PersistentCta />
            <CustomCursor />
          </ContactPrefillProvider>
        </MotionProvider>

        <Analytics />
      </body>
    </html>
  );
}
