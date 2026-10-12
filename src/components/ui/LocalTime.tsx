"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";
import {
  TIME_PLACEHOLDER,
  formatDateInZone,
  formatTimeInZone,
  getUtcOffsetLabel,
} from "@/lib/utils/time";

interface LocalTimeProps {
  timeZone: string;
  locationLabel: string;
  className?: string;
  tone?: "light" | "invert";
}

/**
 * Live local time for the configured time zone (TRD section 8).
 *
 * Three details that matter here:
 *
 * 1. **No hydration mismatch.** The server and the first client render both
 *    output `--:--:--`. The real time is only written after mount, inside an
 *    effect, so React never sees two different values for the same markup.
 *
 * 2. **No hydration mismatch, part two.** The formatted string is produced by
 *    `Intl` on the client only, so a server locale/time-zone setting that
 *    differs from the visitor's cannot leak into the markup.
 *
 * 3. **Seconds are hidden from screen readers.** The seconds are wrapped in an
 *    `aria-hidden` span and the element is not a live region. A clock that
 *    announced itself every second would make the hero unusable with a screen
 *    reader — so assistive technology reads "14:32" and the full date once.
 *
 * The tick is aligned to the next second boundary rather than starting a naive
 * 1000ms interval, which keeps the display from visibly drifting.
 */
export function LocalTime({
  timeZone,
  locationLabel,
  className,
  tone = "light",
}: LocalTimeProps) {
  const [now, setNow] = useState<Date | null>(null);
  const isInvert = tone === "invert";

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const tick = () => setNow(new Date());

    // Align to the next whole second, then tick steadily.
    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 1000);
    }, 1000 - (Date.now() % 1000));

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Pre-mount: fixed-width placeholder, identical on server and client.
  const time = now ? formatTimeInZone(now, timeZone) : TIME_PLACEHOLDER;
  const [hoursAndMinutes, seconds] = now
    ? [time.slice(0, 5), time.slice(6)]
    : [TIME_PLACEHOLDER.slice(0, 5), undefined];

  const fullLabel = now
    ? `${formatDateInZone(now, timeZone)}, ${time} (${getUtcOffsetLabel(now, timeZone)})`
    : "Local time loading";

  return (
    <p
      className={cn(
        "label-meta flex items-center gap-2",
        isInvert ? "text-invert-ink-muted" : "text-ink-muted",
        className,
      )}
    >
      <span>{locationLabel}</span>
      <span aria-hidden="true" className={isInvert ? "text-invert-line" : "text-ink-faint"}>
        /
      </span>

      <time dateTime={now ? now.toISOString() : undefined} title={fullLabel}>
        {/* The accessible name is the hours and minutes; seconds update every
            second and are decorative for anyone not looking at the screen. */}
        <span className={cn("tabular-nums", isInvert ? "text-invert-ink" : "text-ink")}>
          {hoursAndMinutes}
        </span>
        {seconds ? (
          <span
            aria-hidden="true"
            className={cn("tabular-nums", isInvert ? "text-invert-ink-muted" : "text-ink-muted")}
          >
            :{seconds}
          </span>
        ) : null}
      </time>

      <span className="sr-only">{fullLabel}</span>
    </p>
  );
}
