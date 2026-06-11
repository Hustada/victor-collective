import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { useTestDb, closeDb, resetTestDb, getDb } from '../lib/db.js';

let app: express.Express;

beforeAll(async () => {
  useTestDb();
  const { backupRoutes } = await import('../routes/backup.js');
  app = express();
  app.use('/api/backup', backupRoutes); // auth applied at mount in index.ts
});

beforeEach(() => {
  resetTestDb();
});

afterAll(() => {
  closeDb();
});

describe('GET /api/backup', () => {
  it('streams a consistent SQLite snapshot of the live database', async () => {
    getDb()
      .prepare('INSERT INTO subscribers (email, source) VALUES (?, ?)')
      .run('reader@example.com', 'blog');

    const res = await request(app)
      .get('/api/backup')
      .buffer(true)
      .parse((r, cb) => {
        const chunks: Buffer[] = [];
        r.on('data', (c) => chunks.push(c));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/octet-stream');
    expect(res.headers['content-disposition']).toMatch(/victor-collective-.*\.db/);

    const bytes = res.body as Buffer;
    // A real SQLite file, not an error page.
    expect(bytes.subarray(0, 15).toString()).toBe('SQLite format 3');
    // And it actually contains the data.
    expect(bytes.includes(Buffer.from('reader@example.com'))).toBe(true);
  });
});
