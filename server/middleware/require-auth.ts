/**
 * Session-cookie gate for portal API routes.
 */

import type { Request, Response, NextFunction } from 'express';
import { AuthService, SESSION_COOKIE } from '../services/auth.service.js';

/** Extract one cookie value from the raw header; tokens are hex, no decoding needed. */
export function getSessionToken(req: Request): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [name, value] = part.trim().split('=');
    if (name === SESSION_COOKIE && value) return value;
  }
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = getSessionToken(req);
  if (!token || !AuthService.validateSession(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
