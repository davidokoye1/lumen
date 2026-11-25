import "server-only";

type Bucket = { count: number; resetAt: number };
const globalForRl = globalThis as unknown as { __lumenRl?: Map<string, Bucket> };
const buckets = (globalForRl.__lumenRl ??= new Map<string, Bucket>());

/**
 * Fixed-window limiter. In-memory is adequate for a single-node deployment;
 * swap for Redis when running multiple instances.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  b.count += 1;
  if (b.count > limit) return { ok: false, retryAfterMs: b.resetAt - now };
  return { ok: true, retryAfterMs: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

if (buckets.size === 0) {
  // Periodic cleanup so the map can't grow without bound.
  setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }, 60_000).unref?.();
}
