import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Pricing } from "@/components/sections/Pricing";
import { Process } from "@/components/sections/Process";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Services } from "@/components/sections/Services";

/**
 * Homepage — the whole single-page portfolio.
 *
 * Section order follows the sitemap in app-flow section 2 and the conversion
 * path in its section 15: what I do → proof → who I am → how it works → cost →
 * contact. Every section is a Server Component; the client-side pieces are
 * isolated leaves inside them, which keeps the shipped JavaScript small
 * (TRD section 12).
 *
 * There is no page-level metadata here on purpose — the root layout already
 * supplies the canonical title for the homepage.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <SelectedWork />
      <About />
      <Process />
      <Pricing />
      <Contact />
    </>
  );
}
