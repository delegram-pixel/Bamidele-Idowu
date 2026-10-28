import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/Reveal";
import { ProjectArt } from "@/components/projects/ProjectArt";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ProjectMetadata } from "@/components/projects/ProjectMetadata";
import { IndexNumber } from "@/components/ui/IndexNumber";
import { Rule } from "@/components/ui/Rule";
import { SECTION_IDS } from "@/data/nav";
import { getProjectBySlug, getPublishedProjects } from "@/data/projects";
import { siteConfig } from "@/data/site-config";

interface CaseStudyPageProps {
  // Next.js 15 passes route params as a promise.
  params: Promise<{ slug: string }>;
}

/**
 * Pre-render every published case study at build time.
 *
 * Only published projects are generated. An unpublished project therefore has
 * no route at all — it is not merely hidden by a runtime check, so there is no
 * code path that could serve it (backend-schema section 9).
 */
export function generateStaticParams() {
  return getPublishedProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    // An unpublished or unknown slug has no metadata to describe.
    return { title: "Project not found", robots: { index: false, follow: true } };
  }

  const path = `/work/${project.slug}`;

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: `${project.title} — ${siteConfig.name}`,
      description: project.summary,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — ${siteConfig.name}`,
      description: project.summary,
    },
  };
}

/**
 * Project case study (PRD section 7.3, app-flow section 12).
 *
 * The narrative follows the five questions the PRD requires — problem, approach,
 * implementation, result, next steps — but each block is optional and simply
 * omitted when the project data does not have it. That is the mechanism that
 * keeps unconfirmed work honest: an unfinished story renders shorter, rather
 * than being padded out with invented detail.
 *
 * Every case study has its own URL and metadata, so it is directly shareable and
 * survives a refresh (TRD section 4).
 */
export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  // Unknown slug, or a project that is not published: a real 404, not a blank page.
  if (!project) notFound();

  const narrativeSections = [
    { heading: "The problem", body: project.problem },
    { heading: "The approach", body: project.approach },
    { heading: "The implementation", body: project.implementation },
    { heading: "Result and status", body: project.outcome },
    { heading: "What is next", body: project.nextSteps },
  ].filter((section): section is { heading: string; body: string } =>
    Boolean(section.body),
  );

  return (
    <article className="pt-28 pb-24 sm:pt-36">
      <div className="container-page">
        <Link
          href={`/#${SECTION_IDS.work}`}
          className="label-meta inline-flex items-center gap-2 text-ink-muted transition-colors duration-fast hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          All work
        </Link>

        <Rule label="Case study" className="mt-8" />

        <header className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1 className="font-display text-display-sm leading-[0.98] text-ink">
              {project.title}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
              {project.description}
            </p>
          </div>

          <div className="lg:col-span-5">
            {/* The plate carries a hairline rather than the previous soft card.
                The fallback art is itself a printed plate, so a shadow here
                would stack two depth cues on the same object.
                The frame is 16/10 rather than the 4/3 it was: these are browser
                captures, which are wide, so a 4/3 frame left most of the plate
                empty once the image was contained rather than cropped. */}
            <ProjectArt
              project={project}
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="aspect-16/10 rounded-plate border border-line-strong"
            />
          </div>
        </header>

        <div className="mt-14 border-y border-line py-8">
          <ProjectMetadata project={project} />
        </div>

        {narrativeSections.length > 0 ? (
          <div className="mt-16">
            <ol className="flex flex-col">
              {narrativeSections.map((section, index) => (
                <li key={section.heading} className="border-t border-line last:border-b">
                  <Reveal delay={index * 0.04}>
                    <div className="grid gap-6 py-10 lg:grid-cols-12 lg:gap-10 lg:py-12">
                      <div className="lg:col-span-4">
                        {/* Decorative ordinal: the `<ol>` already conveys the
                            sequence, and the heading carries the meaning, so
                            this numeral is `aria-hidden` and set in the faint
                            token — which is a large-text-only weight. */}
                        <IndexNumber
                          value={index + 1}
                          className="text-4xl text-ink-faint"
                        />
                        <h2 className="mt-3 font-display text-xl text-ink sm:text-2xl">
                          {section.heading}
                        </h2>
                      </div>
                      <div className="lg:col-span-8">
                        <p className="max-w-3xl text-base leading-relaxed text-ink-muted">
                          {section.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {/* Extra screenshots, after the story rather than before it: the cover
            already makes the first impression, and opening with a wall of
            images buries the narrative this page exists to tell. Renders
            nothing at all when a project has no gallery. */}
        {project.gallery && project.gallery.length > 0 ? (
          <section className="mt-16" aria-labelledby="gallery-heading">
            <Rule label="Gallery" />
            <h2 id="gallery-heading" className="sr-only">
              {project.title} screenshots
            </h2>
            <ProjectGallery images={project.gallery} className="mt-10" />
          </section>
        ) : null}

        {/* Conversion path closes here (app-flow section 5). */}
        <div className="mt-16 rounded-plate border border-line-strong bg-plate p-8 shadow-plate lg:p-12">
          <h2 className="font-display text-2xl leading-tight text-ink sm:text-3xl">
            Have something similar in mind?
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
            Tell me about it and I will tell you what it would take.
          </p>

          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-none bg-accent-deep px-7 py-3.5 text-base font-medium text-canvas transition-colors duration-fast hover:bg-ink hover:shadow-plate"
          >
            Start a Project
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
