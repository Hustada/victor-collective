/**
 * In-memory login throttle: repeated failures from one source lock login for
 * a window. Deliberately not persisted — a restart clearing it costs nothing;
 * the point is to make sustained brute force against the single portal
 * password impossible, not to keep a permanent record.
 */

const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface Entry {
  failures: number;
  lockedUntil: number | null;
}

const entries = new Map<string, Entry>();

export function isLoginLocked(source: string, now: number = Date.now()): boolean {
  const entry = entries.get(source);
  if (!entry?.lockedUntil) return false;
  if (entry.lockedUntil <= now) {
    entries.delete(source);
    return false;
  }
  return true;
}

export function recordLoginFailure(source: string, now: number = Date.now()): void {
  const entry = entries.get(source) ?? { failures: 0, lockedUntil: null };
  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) entry.lockedUntil = now + LOCKOUT_MS;
  entries.set(source, entry);
}

export function recordLoginSuccess(source: string): void {
  entries.delete(source);
}

/** Test hook. */
export function resetLoginThrottle(): void {
  entries.clear();
}
