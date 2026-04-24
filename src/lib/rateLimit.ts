type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export function applyRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = store.get(key);
  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (existing.count >= limit) return { ok: false };
  existing.count += 1;
  store.set(key, existing);
  return { ok: true };
}
