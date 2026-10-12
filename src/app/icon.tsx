import { ImageResponse } from "next/og";

/**
 * Favicon, generated rather than committed as a binary.
 *
 * A claret plate with a blush monogram and a blush base rule — the same printed
 * rule device the site's section headings use, reduced to its smallest form. At
 * 32px that bar is what stops the mark reading as a plain coloured square.
 *
 * NOTE ON THE WEIGHT: this is the one place a `font-weight` above 400 survives.
 * The site sets `font-synthesis-weight: none` because Instrument Serif has a
 * single weight, but that rule is CSS and does not reach Satori, and a
 * favicon renders in the default sans regardless. At 32 pixels, legibility
 * beats brand consistency, so the monogram stays bold.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // Claret field, blush ink — the inverted pair, which is 9.18:1.
          backgroundColor: "#7F1734",
          // The plate radius, not a pill: the crisp edge is the identity.
          borderRadius: 2,
          color: "#FFF0F5",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          borderBottom: "3px solid #FFF0F5",
        }}
      >
        BI
      </div>
    ),
    size,
  );
}
