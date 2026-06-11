/**
 * Portal auth: server-side password check + SQLite-backed sessions.
 *
 * One password (PORTAL_PASSWORD env), random opaque tokens stored in the
 * sessions table. Validation is a lookup + expiry check, so sessions survive
 * server restarts and can be revoked by deleting the row.
 */

import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { getDb } from '../lib/db.js';

export const SESSION_COOKIE = 'portal_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const AuthService = {
  /** False when PORTAL_PASSWORD is unset — login must fail closed. */
  isConfigured(): boolean {
    return Boolean(process.env.PORTAL_PASSWORD);
  },

  verifyPassword(input: string): boolean {
    const expected = process.env.PORTAL_PASSWORD;
    if (!expected) return false;
    // Hash both sides to equal length so timingSafeEqual is usable.
    const a = createHash('sha256').update(input).digest();
    const b = createHash('sha256').update(expected).digest();
    return timingSafeEqual(a, b);
  },

  createSession(): { token: string; expiresAt: number } {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
    db.prepare('INSERT INTO sessions (token, expires_at) VALUES (?, ?)').run(token, expiresAt);
    return { token, expiresAt };
  },

  validateSession(token: string): boolean {
    const row = getDb().prepare('SELECT expires_at FROM sessions WHERE token = ?').get(token) as
      | { expires_at: number }
      | undefined;
    return row !== undefined && row.expires_at > Date.now();
  },

  deleteSession(token: string): void {
    getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
  },
};
