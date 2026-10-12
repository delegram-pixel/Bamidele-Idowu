import { ImageResponse } from "next/og";

import { siteConfig } from "@/data/site-config";

/**
 * Social sharing image (TRD section 11).
 *
 * Generated at build time rather than committed as a binary, so the copy can
 * never drift out of sync with the site config. Uses `next/og`, which is part
 * of Next.js — no extra dependency.
 *
 * `edge` runtime because ImageResponse is not supported on the Node runtime
 * with the default build.
 *
 * ---------------------------------------------------------------------------
 * TWO DELIBERATE DEVIATIONS, RECORDED
 *
 * 1. **The card is inverted.** It runs claret with blush ink rather than
 *    following the site's light-first canvas. This is the same device as the
 *    Services section and the footer: the palette's strongest tonal beat, and
 *    in a social feed a saturated card is legible where a near-white one
 *    dissolves into the timeline.
 *
 * 2. **The headline is set in the default sans, not Instrument Serif.** Satori
 *    can only render a font whose bytes are handed to it — `next/font` loads
 *    the serif for the browser, but nothing exposes those bytes here. The
 *    alternatives were committing a font binary to the repo or fetching one
 *    from a CDN at build time, and neither is worth a build-time network
 *    dependency for a preview card. Weight is left at 400 rather than the
 *    previous 700 so the face is used as intended instead of faux-bolded.
 * ---------------------------------------------------------------------------
 */
export const runtime = "edge";
export const alt = `${siteConfig.name} — Web Developer and Instructor`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#7F1734",
          padding: "64px 72px",
          // The registration grid from the hero, in blush at the same low
          // opacity, so the card belongs to the same system as the page.
          backgroundImage:
            "linear-gradient(to right, rgba(255,240,245,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,240,245,0.07) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#DFBAC4",
          }}
        >
          <span>{siteConfig.name}</span>
          <span>{siteConfig.locationLabel}</span>
        </div>

        {/* A blush plate pasted onto the claret, with the site's hard offset
            shadow — the collage device, and the one element that makes this
            read as the same site rather than as a generic link preview. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            maxWidth: 900,
            backgroundColor: "#FFF0F5",
            padding: "44px 48px",
            borderRadius: 2,
            boxShadow: "16px 16px 0 0 #5E0F26",
          }}
        >
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.06,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "#7F1734",
            }}
          >
            I build web products people actually use.
          </div>

          <div style={{ fontSize: 26, lineHeight: 1.35, color: "#6E4A57" }}>
            MVPs, business websites, and digital products — built and explained
            clearly.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 22,
            color: "#FFF0F5",
          }}
        >
          <div style={{ width: 56, height: 2, backgroundColor: "#DFBAC4" }} />
          <span>Web developer &amp; instructor</span>
        </div>
      </div>
    ),
    size,
  );
}
