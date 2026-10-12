import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils/cn";
import type { ProjectImage } from "@/types";

interface ProjectGalleryProps {
  images: ProjectImage[];
  className?: string;
}

/**
 * A project's additional screenshots, shown on the case study as a mosaic.
 *
 * The cover in the header is one shot chosen to stand for the whole project.
 * That is enough to make a first impression and never enough to show how
 * something actually works, which is what this is for: the second flow, the
 * filled-in state, the mobile view, the thing that took the longest.
 *
 * The layout is a lead plate across the full measure, then a two-up grid. The
 * lead earns its width by being the shot that says the most about the project,
 * and it breaks up what would otherwise be a monotonous run of near-identical
 * browser captures. One rule keeps the grid from ending in a ragged half-row:
 * when the images after the lead are odd in number, the last one is promoted to
 * the full measure as well. So five images lay out 1 + 2 + 2 and seven lay out
 * 1 + 2 + 2 + 2, both square. That is why the span is computed per index rather
 * than written as one static class list.
 *
 * Tiles are wider than they are tall, because these are browser captures. The
 * frame was `16/10` and before that `4/3`; `4/3` left most of the plate empty
 * once the image was contained. Cropping is not the answer either — slicing the
 * edges off a screenshot removes exactly the interface the screenshot exists to
 * show, which is the problem the gallery was added to fix.
 *
 * There are no visible captions. The alt text describes each image for assistive
 * technology, and printing the same sentence underneath for sighted readers
 * would have a screen reader announce it twice — once as the image, once as the
 * caption. If visible captions are wanted later, the correct move is a separate
 * `caption` field on `ProjectImage` with the image's own alt left to describe
 * the picture, not this string reused for both.
 */
export function ProjectGallery({ images, className }: ProjectGalleryProps) {
  if (images.length === 0) return null;

  // An odd number of images after the lead would leave the final row half
  // empty, so the last tile takes the full measure instead and the grid closes
  // square. A single-image gallery is only the lead, so it is never promoted.
  const promoteLast = images.length > 1 && (images.length - 1) % 2 === 1;

  return (
    <ul
      className={cn(
        // Twelve columns at `lg` is what makes a half-width and a full-width
        // tile land on the same grid; below that, a plain two-up is enough.
        "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:gap-5",
        className,
      )}
    >
      {images.map((image, index) => {
        const isWide =
          index === 0 || (promoteLast && index === images.length - 1);

        return (
          <li
            key={image.src}
            className={cn(
              "group",
              isWide ? "sm:col-span-2 lg:col-span-12" : "lg:col-span-6",
            )}
          >
            <Reveal delay={index * 0.04}>
              <div
                className={cn(
                  "relative overflow-hidden rounded-plate border border-line-strong bg-plate transition-colors duration-fast group-hover:border-ink",
                  isWide
                    ? "aspect-video sm:aspect-21/9"
                    : "aspect-16/10 sm:aspect-video",
                )}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={
                    isWide
                      ? "(min-width: 1024px) 90vw, 100vw"
                      : "(min-width: 1024px) 45vw, (min-width: 640px) 46vw, 92vw"
                  }
                  // The cover has already loaded by the time a reader reaches
                  // this, so every gallery image defers.
                  loading="lazy"
                  // A slight push-in on hover, never a crop: the image is
                  // contained, so the scale stays inside the plate's own
                  // letterbox and the frame's `overflow-hidden` only ever trims
                  // the matting. `motion-safe` rather than `motion-reduce` keeps
                  // the reduced-motion build free of a dead override.
                  //
                  // `duration-base`, not `duration-slow`: the 900ms token was
                  // tuned for a scroll reveal landing once, and at hover speed
                  // it reads as lag rather than as ease.
                  className="object-contain transition-transform duration-base ease-editorial motion-safe:group-hover:scale-[1.02]"
                />
              </div>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
