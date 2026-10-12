/**
 * Placeholder handling.
 *
 * Content that has not been confirmed yet is written as `TODO: ...` in the data
 * files rather than being invented. `yarn validate:content` fails the build
 * while any placeholders remain, which is what stops unapproved copy from
 * reaching production (PRD section 8, acceptance criteria).
 */

export const PLACEHOLDER_PREFIX = "TODO:";

/** True when a string still contains an unresolved `TODO:` marker. */
export function isPlaceholder(value: unknown): boolean {
  return typeof value === "string" && value.includes(PLACEHOLDER_PREFIX);
}

/**
 * True when a value is missing, empty, or an unresolved placeholder — i.e.
 * not something that should be rendered to a visitor.
 */
export function isUnresolved(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length === 0 || isPlaceholder(trimmed);
}

/**
 * Find every placeholder inside an arbitrary nested data structure.
 * Returns dotted paths, e.g. `projects[1].role`.
 */
export function findPlaceholders(value: unknown, path = "root"): string[] {
  if (typeof value === "string") {
    return isPlaceholder(value) ? [path] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findPlaceholders(item, `${path}[${index}]`));
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) =>
      findPlaceholders(nested, `${path}.${key}`),
    );
  }
  return [];
}
