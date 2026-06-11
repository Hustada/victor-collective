/**
 * Off-box backup: GET /api/backup (authed at mount) streams a consistent
 * snapshot of the SQLite database — invoices, sessions, subscribers, the
 * AI caches, and the draft-edit voice dataset. VACUUM INTO gives a clean,
 * compacted copy without locking the live database.
 *
 * Pull it on a schedule from anywhere with the portal cookie:
 *   curl -b portal_session=... -o backup.db https://.../api/backup
 */

import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { getDb } from '../lib/db.js';
import { logger } from '../lib/logger.js';

export const backupRoutes = Router();

backupRoutes.get('/', (req: Request, res: Response) => {
  const tmp = path.join(os.tmpdir(), `vc-backup-${randomBytes(6).toString('hex')}.db`);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');

  try {
    getDb().exec(`VACUUM INTO '${tmp.replace(/'/g, "''")}'`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="victor-collective-${stamp}.db"`);

    const stream = fs.createReadStream(tmp);
    stream.pipe(res);
    stream.on('close', () => fs.unlink(tmp, () => {}));
    stream.on('error', (err) => {
      logger.error('Backup stream failed', { error: err.message });
      fs.unlink(tmp, () => {});
      res.destroy(err);
    });
    logger.info('Backup streamed', { source: req.ip });
  } catch (err) {
    fs.unlink(tmp, () => {});
    logger.error('Backup failed', { error: (err as Error).message });
    res.status(500).json({ error: 'Backup failed' });
  }
});
