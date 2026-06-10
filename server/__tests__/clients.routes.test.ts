import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { useTestDb, closeDb, resetTestDb } from '../lib/db.js';

let app: express.Express;

beforeAll(async () => {
  useTestDb();
  const routesModule = await import('../routes/clients.js');
  app = express();
  app.use(express.json());
  app.use('/api/clients', routesModule.clientRoutes);
});

beforeEach(() => {
  resetTestDb();
});

afterAll(() => {
  closeDb();
});

describe('Client Routes', () => {
  it('returns empty list initially', async () => {
    const res = await request(app).get('/api/clients');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates a client', async () => {
    const res = await request(app)
      .post('/api/clients')
      .send({ name: 'CompanyCam', email: 'ops@companycam.com', notes: 'Active contract' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('CompanyCam');
    expect(res.body.email).toBe('ops@companycam.com');
    expect(res.body.notes).toBe('Active contract');
  });

  it('returns 400 without a name', async () => {
    const res = await request(app).post('/api/clients').send({ email: 'x@y.com' });
    expect(res.status).toBe(400);
  });

  it('lists clients alphabetically', async () => {
    await request(app).post('/api/clients').send({ name: 'Zeta' });
    await request(app).post('/api/clients').send({ name: 'alpha' });

    const res = await request(app).get('/api/clients');
    expect(res.status).toBe(200);
    expect(res.body.map((c: { name: string }) => c.name)).toEqual(['alpha', 'Zeta']);
  });

  it('gets a client by id', async () => {
    const created = await request(app).post('/api/clients').send({ name: 'CompanyCam' });
    const res = await request(app).get(`/api/clients/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('CompanyCam');
  });

  it('returns 404 for a missing client', async () => {
    const res = await request(app).get('/api/clients/999');
    expect(res.status).toBe(404);
  });

  it('updates a client', async () => {
    const created = await request(app).post('/api/clients').send({ name: 'CompanyCam' });
    const res = await request(app)
      .put(`/api/clients/${created.body.id}`)
      .send({ email: 'new@companycam.com' });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('new@companycam.com');
    expect(res.body.name).toBe('CompanyCam');
  });

  it('returns 404 updating a missing client', async () => {
    const res = await request(app).put('/api/clients/999').send({ name: 'x' });
    expect(res.status).toBe(404);
  });

  it('deletes a client', async () => {
    const created = await request(app).post('/api/clients').send({ name: 'CompanyCam' });
    const res = await request(app).delete(`/api/clients/${created.body.id}`);
    expect(res.status).toBe(204);

    const check = await request(app).get(`/api/clients/${created.body.id}`);
    expect(check.status).toBe(404);
  });
});
