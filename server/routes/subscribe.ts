/**
 * Email capture: public POST /api/subscribe from any content surface
 * (site, blog, other platforms — `source` attributes where), stored in the
 * subscribers table with the raw material (source/context) for AI curation.
 * The authed GET /api/subscribers lists the captured audience.
 */

import { Router, Request, Response } from 'express';
import { getDb } from '../lib/db.js';
import { allowContact } from '../lib/contact-throttle.js';
import { logger } from '../lib/logger.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribeRoutes = Router();
export const subscribersRoutes = Router();

subscribeRoutes.post('/', (req: Request, res: Response) => {
  const source = req.ip ?? 'unknown';
  const { email, source: surface, context, company } = (req.body ?? {}) as Record<string, unknown>;

  // Honeypot — bots see success, nothing is stored.
  if (typeof company === 'string' && company.length > 0) {
    logger.info('Subscribe honeypot tripped', { source });
    return res.json({ ok: true });
  }

  if (!allowContact(`sub:${source}`)) {
    logger.warn('Subscribe throttled', { source });
    return res.status(429).json({ error: 'Too many requests — try again later' });
  }

  if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 320) {
    return res.status(400).json({ error: 'a valid email is required' });
  }

  getDb()
    .prepare(
      `INSERT INTO subscribers (email, source, context)
       VALUES (?, ?, ?)
       ON CONFLICT(email) DO NOTHING`
    )
    .run(
      email.trim().toLowerCase(),
      typeof surface === 'string' && surface ? surface.slice(0, 100) : 'site',
      typeof context === 'string' && context ? context.slice(0, 500) : null
    );

  logger.info('Subscriber captured', { source: typeof surface === 'string' ? surface : 'site' });
  res.json({ ok: true });
});

subscribersRoutes.get('/', (_req: Request, res: Response) => {
  const rows = getDb()
    .prepare(
      'SELECT id, email, source, context, tags, created_at FROM subscribers ORDER BY id DESC'
    )
    .all();
  res.json(rows);
});

subscribersRoutes.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });

  const result = getDb().prepare('DELETE FROM subscribers WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });

  logger.info('Subscriber pruned', { id });
  res.json({ ok: true });
});
