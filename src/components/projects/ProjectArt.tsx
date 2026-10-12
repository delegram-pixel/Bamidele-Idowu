import Image from "next/image";

import { FallbackArt } from "@/components/projects/FallbackArt";
import { cn } from "@/lib/utils/cn";
import type { Project } from "@/types";

interface ProjectArtProps {
  project: Project;
  className?: string;
  /** Set on the above-the-fold image only; everything else lazy-loads. */
  priority?: boolean;
  /** `sizes` hint for the responsive image loader. */
  sizes?: string;
}

/**
 * Renders a project's cover image, or generated fallback art when none is set.
 *
 * Two requirements meet here:
 *  - PRD section 8 forbids faking screenshots, so no placeholder image is ever
 *    substituted for a real one.
 *  - app-flow section 13 requires that a missing image does not break the
 *    layout, so the fallback occupies the same box.
 *
 * The wrapper carries the aspect ratio in both branches, so the reserved space
 * is identical either way and the switch cannot cause a layout shift
 * (TRD section 12).
 *
 * The image is `object-contain`, not `object-cover`. Cover fills the frame and
 * clips whatever overflows, which sliced the edges off every screenshot that
 * did not happen to match the frame's ratio — a real browser capture losing its
 * sidebar and half a headline is worse than useless on a page whose job is to
 * show the work. Contain shows the whole image and lets the plate's background
 * take up the slack, so the frame reads as a mount around a print. The plate is
 * `bg-plate` (white) for exactly this reason.
 */
export function ProjectArt({ project, className, priority = false, sizes }: ProjectArtProps) {
  if (!project.coverImage) {
    return <FallbackArt seed={project.slug} label={project.title} className={className} />;
  }

  return (
    <div className={cn("relative isolate overflow-hidden bg-plate", className)}>
      <Image
        src={project.coverImage}
        // Alt text is required alongside a cover image; the validator enforces
        // it, so the fallback here is defensive only.
        alt={project.coverImageAlt ?? `${project.title} screenshot`}
        fill
        sizes={sizes ?? "(min-width: 1024px) 50vw, 100vw"}
        priority={priority}
        // Below-the-fold imagery defers until near the viewport.
        loading={priority ? "eager" : "lazy"}
        className="object-contain"
      />
    </div>
  );
}
