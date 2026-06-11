import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

// The route sends real email through Resend — stub the whole send service.
vi.mock('../services/email-send.service.js', () => ({
  sendEmail: vi.fn(async () => ({ success: true, id: 'mock-id' })),
}));

import { sendEmail } from '../services/email-send.service.js';
import { resetContactThrottle } from '../lib/contact-throttle.js';
import { useTestDb, closeDb, resetTestDb, getDb } from '../lib/db.js';

let app: express.Express;

beforeAll(async () => {
  useTestDb();
  const { contactRoutes } = await import('../routes/contact.js');
  app = express();
  app.use(express.json());
  app.use('/api/contact', contactRoutes);
});

beforeEach(() => {
  vi.mocked(sendEmail).mockClear();
  resetContactThrottle();
  resetTestDb();
});

afterAll(() => {
  closeDb();
});

const valid = {
  name: 'Chris Johnson',
  email: 'chris@imageinflators.com',
  message: 'Interested in the lead intake tool. Can we talk this week?',
};

describe('POST /api/contact', () => {
  it('relays a valid submission into the operator inbox', async () => {
    const res = await request(app).post('/api/contact').send(valid);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(sendEmail).toHaveBeenCalledTimes(1);

    const args = vi.mocked(sendEmail).mock.calls[0][0];
    // Replies go to the human who wrote in…
    expect(args.replyTo).toBe('chris@imageinflators.com');
    // …and the mail must NOT come from the operator's own address, or the
    // classifier's self-send rule buries the lead as noise.
    expect(args.from).toContain('leads@victorcollective.com');
    expect(args.from).toContain('Chris Johnson');
    // Deterministic lead tag: the inbox flags these by prefix + sender.
    expect(args.subject).toMatch(/^\[Lead\]/);
    expect(args.subject).toContain('Chris Johnson');
    expect(args.body).toContain('Interested in the lead intake tool');
  });

  it.each([
    ['missing name', { ...valid, name: '' }],
    ['missing message', { ...valid, message: '' }],
    ['bad email', { ...valid, email: 'not-an-email' }],
    ['oversized message', { ...valid, message: 'x'.repeat(5001) }],
  ])('rejects %s with 400 and sends nothing', async (_label, body) => {
    const res = await request(app).post('/api/contact').send(body);
    expect(res.status).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('captures the lead into the audience list, tagged and attributed', async () => {
    await request(app).post('/api/contact').send(valid);

    const row = getDb()
      .prepare('SELECT email, source, context, tags FROM subscribers WHERE email = ?')
      .get('chris@imageinflators.com') as {
      email: string;
      source: string;
      context: string;
      tags: string;
    };
    expect(row.source).toBe('contact');
    expect(JSON.parse(row.tags)).toContain('lead');
    expect(row.context).toContain('Interested in the lead intake tool');
  });

  it('silently drops honeypot submissions (bots see success, nothing sends)', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...valid, company: 'Totally Real Inc' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('throttles a source after 5 submissions in the window', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/contact').send(valid);
    }
    const sixth = await request(app).post('/api/contact').send(valid);

    expect(sixth.status).toBe(429);
    expect(sendEmail).toHaveBeenCalledTimes(5);
  });

  it('returns 502 when the relay fails, so the form can say so honestly', async () => {
    vi.mocked(sendEmail).mockResolvedValueOnce({ success: false, error: 'resend down' });
    const res = await request(app).post('/api/contact').send(valid);
    expect(res.status).toBe(502);
  });
});
