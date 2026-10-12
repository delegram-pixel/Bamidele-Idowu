/**
 * Best-effort in-memory rate limiting for the contact endpoint.
 *
 * ---------------------------------------------------------------------------
 * IMPORTANT LIMITATION — read before relying on this.
 *
 * This store lives in the process's memory. On a single long-lived server it
 * works as intended. On a serverless platform each instance has its own store,
 * so a determined attacker spreading requests across instances can exceed the
 * limit. It raises the cost of casual abuse; it is not a guarantee.
 *
 * For a hard limit, replace `checkRateLimit` with a shared store (Upstash
 * Redis, Vercel KV, or similar). The call signature is designed so nothing else
 * has to change. See README "Rate limiting" for the swap.
 * ---------------------------------------------------------------------------
 */

interface Bucket {
  /** Timestamps (ms) of recent requests, oldest first. */
  hits: number[];
}

const buckets = new Map<string, Bucket>();

/** Requests allowed per window, per key. */
const MAX_REQUESTS = 5;
/** Window length in milliseconds. */
const WINDOW_MS = 10 * 60 * 1000;
/** Hard cap on tracked keys, so the map cannot grow without bound. */
const MAX_KEYS = 10_000;

export interface RateLimitResult {
  allowed: boolean;
  /** Requests still available in the current window. */
  remaining: number;
  /** Seconds until the caller may retry. Only meaningful when `allowed` is false. */
  retryAfterSeconds: number;
}

/**
 * Record a request against `key` and report whether it is allowed.
 *
 * Old timestamps are pruned on every call, so the map self-cleans for active
 * keys; `MAX_KEYS` bounds the total when keys stop being seen.
 */
export function checkRateLimit(
  key: string,
  now: number = Date.now(),
): RateLimitResult {
  pruneStaleBuckets(now);

  const bucket = buckets.get(key) ?? { hits: [] };
  const cutoff = now - WINDOW_MS;
  const recent = bucket.hits.filter((timestamp) => timestamp > cutoff);

  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0] ?? now;
    const retryAfterMs = Math.max(0, oldest + WINDOW_MS - now);
    buckets.set(key, { hits: recent });

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  recent.push(now);
  buckets.set(key, { hits: recent });

  return {
    allowed: true,
    remaining: MAX_REQUESTS - recent.length,
    retryAfterSeconds: 0,
  };
}

/** Drop buckets whose newest hit has aged out of the window. */
function pruneStaleBuckets(now: number): void {
  const cutoff = now - WINDOW_MS;

  for (const [key, bucket] of buckets) {
    if (bucket.hits.length === 0 || bucket.hits[bucket.hits.length - 1]! <= cutoff) {
      buckets.delete(key);
    }
  }

  // If pruning was not enough, drop the oldest entries rather than growing.
  if (buckets.size > MAX_KEYS) {
    const excess = buckets.size - MAX_KEYS;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++removed >= excess) break;
    }
  }
}

/** Test helper: clear all state between cases. */
export function resetRateLimitStore(): void {
  buckets.clear();
}

/**
 * Derive a rate-limit key from proxy headers.
 *
 * Falls back to a constant when no client IP is available, which degrades to a
 * global limit rather than allowing unlimited submissions.
 */
export function getClientKey(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  return headers.get("x-real-ip")?.trim() || "unknown-client";
}
