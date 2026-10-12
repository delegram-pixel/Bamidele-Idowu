import type { NextConfig } from "next";

/**
 * Security headers (TRD section 14).
 *
 * `Content-Security-Policy` is intentionally not set here: Next.js injects
 * inline bootstrap scripts, so a strict CSP needs a nonce generated in
 * middleware. Adding a broken CSP is worse than adding none, so the policy is
 * left to the deployment platform until middleware-based nonces are added.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // `typedRoutes` is deliberately off: it validates `href` values as literal
  // strings, which rejects the interpolated links this site relies on
  // (`/work/${project.slug}` and `/#${sectionId}`). Enabling it would mean
  // replacing real links with casts, which defeats the point of the check.
  images: {
    // Modern formats first; Next falls back automatically for older browsers.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
