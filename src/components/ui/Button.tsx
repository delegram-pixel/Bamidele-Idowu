import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  /**
   * Solid claret. Canvas on `accent-deep` measures 12.11:1, and on the lighter
   * `ink` hover state 9.18:1 — both clear AA for text at these sizes with room
   * to spare, which is why the fill can afford to be this saturated.
   *
   * The hover adds a hard offset shadow rather than a blur: an offset block
   * reads as a printed card lifting off the page, where a soft shadow reads as
   * generic UI and fights the catalogue's flatness.
   */
  primary:
    "bg-accent-deep text-canvas hover:bg-ink hover:shadow-plate active:translate-y-px",
  secondary:
    "border border-line-strong text-ink hover:border-ink hover:bg-surface",
  ghost: "text-ink-muted hover:text-ink",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  md: "px-5 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const BASE_STYLES =
  // Square corners: the pill radius was the strongest "generic SaaS" signal in
  // the old build, and a crisp rectangle is what sits correctly on a printed
  // grid. `rounded-none` rather than a small radius so the edge is unambiguous
  // at any size.
  "inline-flex items-center justify-center gap-2 rounded-none font-medium " +
  "transition-[background-color,border-color,color,box-shadow] duration-fast " +
  "disabled:pointer-events-none disabled:opacity-50";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type AnchorProps = CommonProps & {
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

type NativeButtonProps = CommonProps & {
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export type ButtonProps = AnchorProps | NativeButtonProps;

/**
 * The single button primitive.
 *
 * Renders an `<a>` when given an `href` and a `<button>` otherwise, so that
 * navigation always uses a real link (middle-click, open-in-new-tab, and screen
 * reader link semantics all keep working) while genuine actions stay buttons.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(BASE_STYLES, VARIANT_STYLES[variant], SIZE_STYLES[size], className);

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { href: _h, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
