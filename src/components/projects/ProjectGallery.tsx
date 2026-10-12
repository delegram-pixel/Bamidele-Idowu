import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils/cn";
import type { ProjectImage } from "@/types";

interface ProjectGalleryProps {
  images: ProjectImage[];
  /** `sizes` hint for the responsive loader. Defaults to the two-column grid. */
  sizes?: string;
  className?: string;
}

/**
 * A project's additional screenshots, shown on the case study.
 *
 * The cover in the header is one shot chosen to stand for the whole project.
 * That is enough to make a first impression and never enough to show how
 * something actually works, which is what this is for: the second flow, the
 * filled-in state, the mobile view, the thing that took the longest.
 *
 * Each image sits in its own plate and is `object-contain` inside a fixed-ratio
 * frame, for the same reason the cover is: these are real captures with their
 * own proportions, and `object-cover` would slice the edges off whichever ones
 * did not match the frame. Uniform frames plus contained images means the grid
 * stays even and no screenshot loses anything.
 *
 * There are no visible captions. The alt text describes each image for assistive
 * technology, and printing the same sentence underneath for sighted readers
 * would have a screen reader announce it twice — once as the image, once as the
 * caption. If visible captions are wanted later, the correct move is a separate
 * `caption` field on `ProjectImage` with the image's own alt left to describe
 * the picture, not this string reused for both.
 */
export function ProjectGallery({ images, sizes, className }: ProjectGalleryProps) {
  if (images.length === 0) return null;

  return (
    <ul className={cn("grid gap-8 lg:grid-cols-2 lg:gap-10", className)}>
      {images.map((image, index) => (
        <li key={image.src}>
          <Reveal delay={index * 0.04}>
            <div className="relative aspect-16/10 overflow-hidden rounded-plate border border-line-strong bg-plate">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={sizes ?? "(min-width: 1024px) 46vw, 100vw"}
                // The cover has already loaded by the time a reader reaches
                // this, so every gallery image defers.
                loading="lazy"
                className="object-contain"
              />
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
