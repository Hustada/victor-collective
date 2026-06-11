/**
 * Contact-form throttle: a sliding window per source, because the endpoint is
 * public. In-memory by design — the goal is stopping bursts and bots, not
 * keeping records.
 */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

/** Returns true and records the hit if the source is under the limit. */
export function allowContact(source: string, now: number = Date.now()): boolean {
  const recent = (hits.get(source) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(source, recent);
    return false;
  }
  recent.push(now);
  hits.set(source, recent);
  return true;
}

/** Test hook. */
export function resetContactThrottle(): void {
  hits.clear();
}
