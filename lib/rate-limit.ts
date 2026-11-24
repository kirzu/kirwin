/**
 * Minimal in-process rate limiter.
 *
 * Purpose: raise the cost of online guessing and form spam without adding
 * infrastructure. It is deliberately simple — a sliding window per key held
 * in module memory.
 *
 * Limitations (be honest about these):
 *  - Serverless platforms (Vercel) run several instances, so each instance
 *    keeps its own counters. The effective limit is per instance, not global.
 *  - Counters reset when an instance recycles.
 * For strong protection, move the counters to a shared store (Upstash Redis,
 * Vercel KV) and keep this interface.
 */

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Maximum hits allowed per key inside the window. */
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Milliseconds until the oldest hit leaves the window. */
  retryAfterMs: number;
}

/** Returns whether `key` is still within its allowance, and records the hit. */
export function rateLimit(key: string, { windowMs, max }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }

  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= max) {
    const oldest = bucket.hits[0] ?? now;
    return { ok: false, retryAfterMs: Math.max(0, oldest + windowMs - now) };
  }

  bucket.hits.push(now);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.hits.every((t) => t <= cutoff)) buckets.delete(k);
    }
  }

  return { ok: true, retryAfterMs: 0 };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
