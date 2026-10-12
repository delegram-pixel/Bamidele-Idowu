/**
 * Port Harcourt local-time formatting (TRD section 8).
 *
 * All formatting goes through `Intl` with an explicit IANA time zone so the
 * displayed time is correct for visitors in any locale — and, importantly,
 * identical on the server and the client, which is what prevents hydration
 * mismatches.
 *
 * The clock component never renders a formatted time during server rendering.
 * It renders a fixed-width placeholder and fills it in after mount, so there is
 * nothing for React to disagree about (see components/ui/LocalTime.tsx).
 */

/** Locale chosen so the clock reads 24-hour and unambiguous across regions. */
export const CLOCK_LOCALE = "en-GB";

/** Stable placeholder with the same width as a formatted time, e.g. `--:--:--`. */
export const TIME_PLACEHOLDER = "--:--:--";

interface FormatOptions {
  /** Include seconds. Defaults to true for the hero clock. */
  withSeconds?: boolean;
}

/** Format an instant as wall-clock time in the given time zone. */
export function formatTimeInZone(
  date: Date,
  timeZone: string,
  options: FormatOptions = {},
): string {
  const { withSeconds = true } = options;

  return new Intl.DateTimeFormat(CLOCK_LOCALE, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
    hour12: false,
  }).format(date);
}

/** Short weekday + date in the given time zone, e.g. `Sun 12 Oct`. */
export function formatDateInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(CLOCK_LOCALE, {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

/**
 * Whole-hour offset of a time zone from UTC at a given instant, e.g. `+01`.
 *
 * Uses `Intl` rather than a fixed offset because Nigeria does not observe
 * daylight saving today but the code should not depend on that staying true.
 */
export function getUtcOffsetLabel(date: Date, timeZone: string): string {
  const offsetPart = new Intl.DateTimeFormat(CLOCK_LOCALE, {
    timeZone,
    timeZoneName: "shortOffset",
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;

  // Returns e.g. "GMT+1"; normalise to "+01:00".
  const match = offsetPart?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return "UTC+00:00";

  const [, sign, hours, minutes = "00"] = match;
  return `UTC${sign}${hours.padStart(2, "0")}:${minutes}`;
}

/** Time-of-day greeting used beside the clock. */
export function getGreeting(date: Date, timeZone: string): string {
  const hour = Number(
    new Intl.DateTimeFormat(CLOCK_LOCALE, {
      timeZone,
      hour: "2-digit",
      hour12: false,
    }).format(date),
  );

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
