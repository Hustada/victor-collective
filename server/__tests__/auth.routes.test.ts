import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { useTestDb, closeDb, resetTestDb, getDb } from '../lib/db.js';

const TEST_PASSWORD = 'correct-horse-battery';

let app: express.Express;

beforeAll(async () => {
  process.env.PORTAL_PASSWORD = TEST_PASSWORD;
  useTestDb();
  const { authRoutes } = await import('../routes/auth.js');
  const { requireAuth } = await import('../middleware/require-auth.js');
  const { clientRoutes } = await import('../routes/clients.js');

  app = express();
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/clients', requireAuth, clientRoutes);
});

beforeEach(() => {
  resetTestDb();
});

afterAll(() => {
  closeDb();
});

async function login(): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ password: TEST_PASSWORD });
  return res.headers['set-cookie'][0].split(';')[0];
}

describe('POST /api/auth/login', () => {
  it('sets an httpOnly session cookie for the correct password', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toContain('portal_session=');
    expect(cookie.toLowerCase()).toContain('httponly');
    expect(cookie.toLowerCase()).toContain('samesite=lax');
  });

  it('rejects a wrong password without setting a cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('rejects a missing password', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('fails closed when PORTAL_PASSWORD is not configured', async () => {
    const saved = process.env.PORTAL_PASSWORD;
    delete process.env.PORTAL_PASSWORD;

    const res = await request(app).post('/api/auth/login').send({ password: TEST_PASSWORD });
    expect(res.status).toBe(503);

    process.env.PORTAL_PASSWORD = saved;
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 without a session', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 200 with a valid session', async () => {
    const cookie = await login();
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
  });

  it('returns 401 for an expired session', async () => {
    getDb()
      .prepare('INSERT INTO sessions (token, expires_at) VALUES (?, ?)')
      .run('expired-token', Date.now() - 1000);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'portal_session=expired-token');
    expect(res.status).toBe(401);
  });

  it('returns 401 for a forged token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'portal_session=not-a-real-token');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('invalidates the session', async () => {
    const cookie = await login();

    const logout = await request(app).post('/api/auth/logout').set('Cookie', cookie);
    expect(logout.status).toBe(200);

    const me = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(me.status).toBe(401);
  });
});

describe('requireAuth middleware', () => {
  it('rejects unauthenticated requests to protected routes', async () => {
    const res = await request(app).get('/api/clients');
    expect(res.status).toBe(401);
  });

  it('rejects protected writes without a session', async () => {
    const res = await request(app).post('/api/clients').send({ name: 'Intruder' });
    expect(res.status).toBe(401);
  });

  it('allows authenticated requests through', async () => {
    const cookie = await login();
    const res = await request(app).get('/api/clients').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('leaves /health open', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
