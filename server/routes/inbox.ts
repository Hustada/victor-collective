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
} from '../services/email-inbox.service.js';
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

export const inboxRoutes = router;
