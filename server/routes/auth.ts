/**
 * Portal auth routes: login, logout, session check.
 */

import { Router } from 'express';
import { AuthService, SESSION_COOKIE } from '../services/auth.service.js';
import { getSessionToken, requireAuth } from '../middleware/require-auth.js';
import { isLoginLocked, recordLoginFailure, recordLoginSuccess } from '../lib/login-throttle.js';
import { logger } from '../lib/logger.js';

export const authRoutes = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

authRoutes.post('/login', (req, res) => {
  const { password } = req.body ?? {};
  const source = req.ip ?? 'unknown';

  if (isLoginLocked(source)) {
    logger.warn('Login locked out', { source });
    return res.status(429).json({ error: 'Too many attempts — try again later' });
  }

  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'password is required' });
  }

  if (!AuthService.isConfigured()) {
    logger.error('Login rejected: PORTAL_PASSWORD is not set');
    return res.status(503).json({ error: 'Auth is not configured' });
  }

  if (!AuthService.verifyPassword(password)) {
    recordLoginFailure(source);
    logger.info('Login failed: wrong password', { source });
    return res.status(401).json({ error: 'Wrong password' });
  }

  recordLoginSuccess(source);
  const { token, expiresAt } = AuthService.createSession();
  res.cookie(SESSION_COOKIE, token, { ...COOKIE_OPTIONS, expires: new Date(expiresAt) });
  logger.info('Login succeeded');
  res.json({ ok: true });
});

authRoutes.post('/logout', (req, res) => {
  const token = getSessionToken(req);
  if (token) AuthService.deleteSession(token);
  res.clearCookie(SESSION_COOKIE, COOKIE_OPTIONS);
  res.json({ ok: true });
});

authRoutes.get('/me', requireAuth, (_req, res) => {
  res.json({ ok: true });
});
