/**
 * URL safety checks.
 *
 * Extracted external URLs are rendered as links, so they are validated before
 * use rather than trusted from data files (backend-schema section 10).
 */

/** Protocols permitted in outbound links. */
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * True when a URL is safe to place in an `href`.
 *
 * Rejects `javascript:`, `data:`, and anything else that could execute or
 * exfiltrate when clicked.
 */
export function isSafeExternalUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

/** Absolute URL for a site-relative path, used for canonical and OG metadata. */
export function absoluteUrl(path: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

/** Build a `mailto:` link with an optional prefilled subject. */
export function mailtoUrl(email: string, subject?: string): string {
  if (!subject) return `mailto:${email}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

/** Build a WhatsApp link, returning undefined when no number is configured. */
export function whatsappUrl(
  configuredUrl: string | undefined,
  message?: string,
): string | undefined {
  if (!isSafeExternalUrl(configuredUrl) || !configuredUrl) return undefined;
  if (!message) return configuredUrl;

  const separator = configuredUrl.includes("?") ? "&" : "?";
  return `${configuredUrl}${separator}text=${encodeURIComponent(message)}`;
}
