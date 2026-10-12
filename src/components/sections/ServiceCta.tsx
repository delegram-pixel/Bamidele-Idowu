"use client";

import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { useContactPrefill } from "@/components/contact/ContactPrefillContext";
import { Magnetic } from "@/components/motion/Magnetic";
import { SECTION_IDS } from "@/data/nav";
import { cn } from "@/lib/utils/cn";
import type { ContactProjectType } from "@/types";

interface ServiceCtaProps {
  /** Project type to pre-select in the contact form. */
  projectType: ContactProjectType;
  children: ReactNode;
  /** Visual treatment. `quiet` is the inline text link used on list items. */
  variant?: "solid" | "quiet";
  /**
   * Which ground this link sits on. Services is the inverted section, so the
   * quiet variant there has to use the blush ink tokens — a claret link on a
   * claret panel is invisible.
   */
  tone?: "light" | "invert";
}

/**
 * "Enquire about this service" link.
 *
 * Sets the contact form's project type before following the anchor, so the
 * visitor arrives with the right option already chosen (app-flow section 4).
 * The `href` is a real anchor, so the jump works even if this handler never runs.
 */
export function ServiceCta({
  projectType,
  children,
  variant = "quiet",
  tone = "light",
}: ServiceCtaProps) {
  const { requestProjectType } = useContactPrefill();
  const isInvert = tone === "invert";

  const handleClick = () => {
    requestProjectType(projectType);
  };

  if (variant === "solid") {
    return (
      <Magnetic>
        <a
          href={`#${SECTION_IDS.contact}`}
          onClick={handleClick}
          className={cn(
            "inline-flex items-center gap-2 rounded-none px-6 py-3 text-sm font-medium",
            "transition-[background-color,color,box-shadow] duration-fast",
            // Inverted: the fill and the ink swap, so the button keeps the same
            // figure/ground relationship with its section in both tones.
            isInvert
              ? "bg-canvas text-accent-deep hover:bg-invert-ink-muted"
              : "bg-accent-deep text-canvas hover:bg-ink hover:shadow-plate",
          )}
        >
          {children}
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </Magnetic>
    );
  }

  return (
    <a
      href={`#${SECTION_IDS.contact}`}
      onClick={handleClick}
      className={cn(
        "group label-meta inline-flex items-center gap-2",
        "border-b pb-1 transition-colors duration-fast",
        // The underline is the affordance, so it is drawn at full strength and
        // the text colour carries the hover — the reverse would leave a link
        // that looks identical to static label text at rest.
        isInvert
          ? "border-invert-line text-invert-ink hover:border-invert-ink"
          : "border-line-strong text-ink hover:border-ink",
      )}
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        className="size-3.5 transition-transform duration-fast group-hover:translate-x-1"
      />
    </a>
  );
}
