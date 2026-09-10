// In-memory sliding-window limiter. NFR-2026-001 §3/§4 accepts a single
// instance for v1.0 given the low, predictable booking volume, so this is
// sufficient; move to a shared store (Redis) if the service is ever scaled
// horizontally.
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > max;
}
