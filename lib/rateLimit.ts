/**
 * Simple sliding-window in-memory rate limiter.
 * Works fine for single-instance deployments (Vercel hobby / small scale).
 * Upgrade path: swap the Map for Upstash Redis when you hit multiple instances.
 */

interface Window {
  count: number;
  resetAt: number; // epoch ms
}

// Separate stores per "bucket" so transcribe and generate don't share limits
const stores = new Map<string, Map<string, Window>>();

function getStore(bucket: string): Map<string, Window> {
  if (!stores.has(bucket)) stores.set(bucket, new Map());
  return stores.get(bucket)!;
}

/**
 * Returns { allowed: true } or { allowed: false, retryAfter: seconds }
 *
 * @param bucket   Logical name for this limit (e.g. 'transcribe', 'generate')
 * @param key      Per-client identifier — use IP address
 * @param limit    Max requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowMs: number
): { allowed: true } | { allowed: false; retryAfter: number } {
  const store = getStore(bucket);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true };
}

/** Extract client IP from Next.js request headers */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
