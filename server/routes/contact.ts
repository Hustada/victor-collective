/**
 * Public contact form → the operator's classified inbox.
 *
 * Submissions are relayed via Resend FROM leads@victorcollective.com (never
 * the operator's own address — the classifier's self-send rule would bury
 * them as noise) with Reply-To set to the human who wrote in, so inbox
 * replies and draft-ahead go to the right place. Subject carries a [Lead]
 * tag the inbox can key on.
 */

import { Router, Request, Response } from 'express';
import { sendEmail } from '../services/email-send.service.js';
import { allowContact } from '../lib/contact-throttle.js';
import { logger } from '../lib/logger.js';

const LEADS_FROM = 'leads@victorcollective.com';
const CONTACT_TO = process.env.IMAP_USER || 'victorhustad@victorcollective.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const contactRoutes = Router();

contactRoutes.post('/', async (req: Request, res: Response) => {
  const source = req.ip ?? 'unknown';
  const { name, email, message, company } = (req.body ?? {}) as Record<string, unknown>;

  // Honeypot: humans never see the field; bots that fill it get a quiet "ok".
  if (typeof company === 'string' && company.length > 0) {
    logger.info('Contact honeypot tripped', { source });
    return res.json({ ok: true });
  }

  if (!allowContact(source)) {
    logger.warn('Contact throttled', { source });
    return res.status(429).json({ error: 'Too many messages — try again later' });
  }

  if (
    typeof name !== 'string' ||
    name.trim().length === 0 ||
    name.length > 200 ||
    typeof email !== 'string' ||
    !EMAIL_RE.test(email) ||
    email.length > 320 ||
    typeof message !== 'string' ||
    message.trim().length === 0 ||
    message.length > 5000
  ) {
    return res.status(400).json({ error: 'name, a valid email, and a message are required' });
  }

  const cleanName = name
    .trim()
    .replace(/[\r\n<>"]/g, ' ')
    .trim();
  const result = await sendEmail({
    to: CONTACT_TO,
    from: `${cleanName} via victorcollective.com <${LEADS_FROM}>`,
    replyTo: email,
    subject: `[Lead] ${cleanName}`,
    body: `${message.trim()}\n\n—\nFrom the victorcollective.com contact form\nName: ${cleanName}\nEmail: ${email}`,
  });

  if (!result.success) {
    logger.error('Contact relay failed', { error: result.error });
    return res.status(502).json({ error: 'Could not send right now — email us directly' });
  }

  logger.info('Contact form relayed to inbox', { source });
  res.json({ ok: true });
});
