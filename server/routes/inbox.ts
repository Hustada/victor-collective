/**
 * Inbox Routes
 *
 * API endpoints for email inbox management.
 */

import { Router, Request, Response } from 'express';
import {
  listEmails,
  getEmail,
  markAsRead,
  markAsUnread,
  deleteEmail,
  getFolders,
  listSentExamples,
} from '../services/email-inbox.service.js';
import { sendEmail } from '../services/email-send.service.js';
import { regenerateDraft, markDraftSent } from '../services/draft.service.js';
import { getActivity } from '../lib/ai-activity.js';
import { logger } from '../lib/logger.js';

const router = Router();

// GET /api/inbox - List emails
router.get('/', async (req: Request, res: Response) => {
  try {
    const folder = (req.query.folder as string) || 'INBOX';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await listEmails(folder, limit, offset);
    res.json(result);
  } catch (err) {
    logger.error('Failed to list emails', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// GET /api/inbox/folders - List folders
router.get('/folders', async (_req: Request, res: Response) => {
  try {
    const folders = await getFolders();
    res.json(folders);
  } catch (err) {
    logger.error('Failed to list folders', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// GET /api/inbox/activity - Live AI activity (ticker + agent console).
// Registered before /:uid so the param route doesn't swallow it.
router.get('/activity', (_req: Request, res: Response) => {
  res.json(getActivity());
});

// GET /api/inbox/:uid - Get single email
router.get('/:uid', async (req: Request, res: Response) => {
  try {
    const uid = parseInt(req.params.uid);
    const folder = (req.query.folder as string) || 'INBOX';

    const email = await getEmail(uid, folder);

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json(email);
  } catch (err) {
    logger.error('Failed to get email', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

// POST /api/inbox/:uid/draft - Regenerate the draft reply (explicit re-call)
router.post('/:uid/draft', async (req: Request, res: Response) => {
  try {
    const uid = parseInt(req.params.uid);
    const folder = (req.query.folder as string) || 'INBOX';

    const email = await getEmail(uid, folder);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const draft = await regenerateDraft(
      {
        messageId: email.messageId,
        subject: email.subject,
        from: `${email.from.name} <${email.from.address}>`.trim(),
        body: email.text || email.preview,
        intent: email.intent,
      },
      await listSentExamples()
    );

    logger.info('Draft regenerated', { uid, messageId: email.messageId });
    res.json({ draft });
  } catch (err) {
    logger.error('Failed to regenerate draft', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to regenerate draft' });
  }
});

// PATCH /api/inbox/:uid/read - Mark as read
router.patch('/:uid/read', async (req: Request, res: Response) => {
  try {
    const uid = parseInt(req.params.uid);
    const folder = (req.query.folder as string) || 'INBOX';

    await markAsRead(uid, folder);
    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to mark as read', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// PATCH /api/inbox/:uid/unread - Mark as unread
router.patch('/:uid/unread', async (req: Request, res: Response) => {
  try {
    const uid = parseInt(req.params.uid);
    const folder = (req.query.folder as string) || 'INBOX';

    await markAsUnread(uid, folder);
    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to mark as unread', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to mark as unread' });
  }
});

// DELETE /api/inbox/:uid - Delete email
router.delete('/:uid', async (req: Request, res: Response) => {
  try {
    const uid = parseInt(req.params.uid);
    const folder = (req.query.folder as string) || 'INBOX';

    await deleteEmail(uid, folder);
    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to delete email', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

// POST /api/inbox/send - Send email
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { to, subject, body, replyTo, messageId } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    const result = await sendEmail({ to, subject, body, replyTo });

    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Failed to send email' });
    }

    // Close the draft loop: final body (with any edits) is voice-tuning signal.
    if (typeof messageId === 'string' && messageId) {
      markDraftSent(messageId, body);
    }

    res.json({ success: true, id: result.id });
  } catch (err) {
    logger.error('Failed to send email', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export const inboxRoutes = router;
