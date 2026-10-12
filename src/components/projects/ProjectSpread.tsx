import { ArrowUpRight } from "lucide-react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { FallbackArt } from "@/components/projects/FallbackArt";
import { ProjectMetadata } from "@/components/projects/ProjectMetadata";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { cn } from "@/lib/utils/cn";
import type { Project } from "@/types";

interface ProjectSpreadProps {
  project: Project;
  /** Position in the sequence, used for the index label and stagger. */
  index: number;
  /** Total in the sequence. */
  total: number;
}

/**
 * One editorial case-study spread (design-brief section 8).
 *
 * The brief says projects should not be forced into an identical template, so
 * alternating spreads mirror their composition: the image leads on one, the
 * text leads on the next. The information is identical either way, which keeps
 * the reading experience consistent while avoiding four identical panels.
 *
 * The plate carries a hairline rather than the previous `rounded-2xl` card. A
 * hard offset shadow was considered here and rejected: the rail is an
 * `overflow-x` scroller, which computes `overflow-y` to `auto`, so the shadow
 * would be clipped vertically and could produce a scrollbar inside the rail.
 * The hairline alone is enough to separate the plate from the canvas.
 *
 * The art on the landing page is generated, not the project's real screenshot.
 * The screenshots come from products with their own colour systems, and at this
 * size against the claret/blush canvas they read as foreign objects pasted into
 * the page rather than as part of it. The duotone plates hold the composition,
 * and the genuine screenshot appears on the case study itself, where it is the
 * subject rather than decoration. This is a deliberate split: swapping
 * `FallbackArt` back to `ProjectArt` here would put the raw screenshots back on
 * the homepage.
 */
export function ProjectSpread({ project, index, total }: ProjectSpreadProps) {
  const isReversed = index % 2 === 1;

  return (
    <li
      className={cn(
        "lg:snap-start",
        // Each slide is slightly narrower than the rail so the next project
        // peeks in, which is what signals that the rail is scrollable at all.
        "lg:w-[86%] lg:shrink-0 xl:w-[80%]",
      )}
    >
      <article className="grid h-full gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className={cn("lg:col-span-7", isReversed && "lg:order-2")}>
          <FallbackArt
            seed={project.slug}
            label={project.title}
            className="aspect-16/11 rounded-plate border border-line-strong"
          />
        </div>

        <div className={cn("lg:col-span-5", isReversed && "lg:order-1")}>
          <div className="flex items-center gap-4">
            <span className="label-meta shrink-0 text-ink">
              {String(index + 1).padStart(2, "0")}
              <span aria-hidden="true" className="text-ink-muted">
                {" / "}
                {String(total).padStart(2, "0")}
              </span>
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
            <StatusBadge status={project.status} />
          </div>

          <h3 className="mt-6 text-3xl leading-[1.05] text-ink sm:text-4xl">
            {project.title}
          </h3>

          <p className="mt-4 text-base leading-relaxed text-ink-muted">{project.summary}</p>

          <div className="mt-8">
            <ProjectMetadata project={project} />
          </div>

          <TrackedLink
            href={`/work/${project.slug}`}
            event={ANALYTICS_EVENTS.projectOpen}
            eventProps={{ slug: project.slug, source: "work" }}
            className="group/link label-meta mt-8 inline-flex items-center gap-2 border-b border-line-strong pb-1 text-ink transition-colors duration-fast hover:border-ink"
          >
            View case study
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-fast group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
            />
          </TrackedLink>
        </div>
      </article>
    </li>
  );
}
