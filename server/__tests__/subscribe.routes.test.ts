import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { useTestDb, closeDb, resetTestDb, getDb } from '../lib/db.js';
import { resetContactThrottle } from '../lib/contact-throttle.js';

let app: express.Express;

beforeAll(async () => {
  useTestDb();
  const { subscribeRoutes, subscribersRoutes } = await import('../routes/subscribe.js');
  app = express();
  app.use(express.json());
  app.use('/api/subscribe', subscribeRoutes);
  app.use('/api/subscribers', subscribersRoutes); // auth is applied at mount in index.ts
});

beforeEach(() => {
  resetTestDb();
  resetContactThrottle();
});

describe('POST /api/subscribe', () => {
  it('captures an email with source and context', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .send({ email: 'reader@example.com', source: 'blog', context: 'intent-engineering post' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const row = getDb()
      .prepare('SELECT email, source, context, tags FROM subscribers WHERE email = ?')
      .get('reader@example.com') as { email: string; source: string; context: string };
    expect(row.source).toBe('blog');
    expect(row.context).toBe('intent-engineering post');
  });

  it('is idempotent: subscribing twice keeps one row and still says ok', async () => {
    await request(app).post('/api/subscribe').send({ email: 'reader@example.com' });
    const again = await request(app).post('/api/subscribe').send({ email: 'reader@example.com' });

    expect(again.status).toBe(200);
    const count = getDb().prepare('SELECT COUNT(*) AS n FROM subscribers').get() as { n: number };
    expect(count.n).toBe(1);
  });

  it('normalizes the email to lowercase', async () => {
    await request(app).post('/api/subscribe').send({ email: 'Reader@Example.COM' });
    const row = getDb().prepare('SELECT email FROM subscribers').get() as { email: string };
    expect(row.email).toBe('reader@example.com');
  });

  it('rejects an invalid email with 400 and stores nothing', async () => {
    const res = await request(app).post('/api/subscribe').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    const count = getDb().prepare('SELECT COUNT(*) AS n FROM subscribers').get() as { n: number };
    expect(count.n).toBe(0);
  });

  it('silently drops honeypot submissions', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .send({ email: 'bot@spam.com', company: 'Spam Inc' });
    expect(res.status).toBe(200);
    const count = getDb().prepare('SELECT COUNT(*) AS n FROM subscribers').get() as { n: number };
    expect(count.n).toBe(0);
  });
});

describe('GET /api/subscribers', () => {
  it('lists captured subscribers newest first', async () => {
    await request(app).post('/api/subscribe').send({ email: 'a@example.com', source: 'blog' });
    await request(app).post('/api/subscribe').send({ email: 'b@example.com', source: 'x' });

    const res = await request(app).get('/api/subscribers');
    expect(res.status).toBe(200);
    expect(res.body.map((s: { email: string }) => s.email)).toEqual([
      'b@example.com',
      'a@example.com',
    ]);
  });
});

describe('DELETE /api/subscribers/:id', () => {
  it('prunes a subscriber from the list', async () => {
    await request(app).post('/api/subscribe').send({ email: 'probe@example.com' });
    const [row] = (await request(app).get('/api/subscribers')).body as { id: number }[];

    const res = await request(app).delete(`/api/subscribers/${row.id}`);
    expect(res.status).toBe(200);
    expect((await request(app).get('/api/subscribers')).body).toEqual([]);
  });

  it('404s for an unknown id', async () => {
    const res = await request(app).delete('/api/subscribers/9999');
    expect(res.status).toBe(404);
  });
});
