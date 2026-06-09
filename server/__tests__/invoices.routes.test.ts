import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { useTestDb, closeDb, resetTestDb } from '../lib/db.js';

// Mock the email sender so tests never hit the network / Resend API
vi.mock('../services/email-send.service.js', () => ({
  sendEmail: vi.fn(async () => ({ success: true, id: 'test-email-id' })),
  sendRawEmail: vi.fn(async () => ({ success: true, id: 'test-email-id' })),
}));

let app: express.Express;
let InvoiceService: typeof import('../services/invoice.service.js').InvoiceService;
let ClientService: typeof import('../services/client.service.js').ClientService;

beforeAll(async () => {
  useTestDb();

  // Import services
  const invoiceModule = await import('../services/invoice.service.js');
  InvoiceService = invoiceModule.InvoiceService;
  const clientModule = await import('../services/client.service.js');
  ClientService = clientModule.ClientService;

  // Import routes
  const routesModule = await import('../routes/invoices.js');

  // Set up Express app
  app = express();
  app.use(express.json());
  app.use('/api/invoices', routesModule.invoiceRoutes);
});

beforeEach(() => {
  resetTestDb();
});

afterAll(() => {
  closeDb();
});

describe('Invoice Routes', () => {
  describe('GET /api/invoices', () => {
    it('returns empty list initially', async () => {
      const res = await request(app).get('/api/invoices');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns all invoices', async () => {
      InvoiceService.create({ clientName: 'Client A', weekEnding: '2026-05-30' });
      InvoiceService.create({ clientName: 'Client B', weekEnding: '2026-05-30' });

      const res = await request(app).get('/api/invoices');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('filters by client', async () => {
      InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });
      InvoiceService.create({ clientName: 'Other', weekEnding: '2026-05-30' });

      const res = await request(app).get('/api/invoices?client=CompanyCam');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].clientName).toBe('CompanyCam');
    });

    it('filters by status', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });
      InvoiceService.create({ clientName: 'Other', weekEnding: '2026-05-30' });
      InvoiceService.updateStatus(invoice.id, 'sent');

      const res = await request(app).get('/api/invoices?status=sent');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].status).toBe('sent');
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('returns invoice with line items', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });
      InvoiceService.addLineItem(invoice.id, {
        description: 'Weekly fee',
        quantity: 1,
        unitPrice: 380000,
      });

      const res = await request(app).get(`/api/invoices/${invoice.id}`);
      expect(res.status).toBe(200);
      expect(res.body.clientName).toBe('CompanyCam');
      expect(res.body.lineItems).toHaveLength(1);
    });

    it('returns 404 for non-existent invoice', async () => {
      const res = await request(app).get('/api/invoices/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/invoices', () => {
    it('creates invoice', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .send({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });

      expect(res.status).toBe(201);
      expect(res.body.clientName).toBe('CompanyCam');
      expect(res.body.invoiceNumber).toMatch(/^TVC-\d{4}-001$/);
    });

    it('returns 400 without clientName', async () => {
      const res = await request(app).post('/api/invoices').send({ weekEnding: '2026-05-30' });

      expect(res.status).toBe(400);
    });

    it('returns 400 without weekEnding', async () => {
      const res = await request(app).post('/api/invoices').send({ clientName: 'CompanyCam' });

      expect(res.status).toBe(400);
    });

    it('persists client email', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .send({
          clientName: 'CompanyCam',
          weekEnding: '2026-05-30',
          clientEmail: 'ops@companycam.com',
        });

      expect(res.status).toBe(201);
      expect(res.body.clientEmail).toBe('ops@companycam.com');
    });

    it('snapshots name and email from a registry client', async () => {
      const client = ClientService.create({ name: 'CompanyCam', email: 'ops@companycam.com' });

      const res = await request(app)
        .post('/api/invoices')
        .send({ clientId: client.id, weekEnding: '2026-05-30' });

      expect(res.status).toBe(201);
      expect(res.body.clientId).toBe(client.id);
      expect(res.body.clientName).toBe('CompanyCam');
      expect(res.body.clientEmail).toBe('ops@companycam.com');
    });

    it('returns 400 for an unknown client id', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .send({ clientId: 999, weekEnding: '2026-05-30' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/invoices/:id', () => {
    it('updates invoice', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });

      const res = await request(app)
        .put(`/api/invoices/${invoice.id}`)
        .send({ notes: 'Updated notes' });

      expect(res.status).toBe(200);
      expect(res.body.notes).toBe('Updated notes');
    });

    it('returns 404 for non-existent invoice', async () => {
      const res = await request(app).put('/api/invoices/999').send({ notes: 'test' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/invoices/:id', () => {
    it('deletes invoice', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });

      const res = await request(app).delete(`/api/invoices/${invoice.id}`);
      expect(res.status).toBe(204);

      const check = await request(app).get(`/api/invoices/${invoice.id}`);
      expect(check.status).toBe(404);
    });
  });

  describe('POST /api/invoices/:id/line-items', () => {
    it('adds line item', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });

      const res = await request(app).post(`/api/invoices/${invoice.id}/line-items`).send({
        description: 'Weekly fee',
        quantity: 1,
        unitPrice: 380000,
      });

      expect(res.status).toBe(201);
      expect(res.body.amount).toBe(380000);
    });

    it('returns 404 for non-existent invoice', async () => {
      const res = await request(app).post('/api/invoices/999/line-items').send({
        description: 'Test',
        quantity: 1,
        unitPrice: 1000,
      });

      expect(res.status).toBe(404);
    });

    it('returns 400 without required fields', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });

      const res = await request(app)
        .post(`/api/invoices/${invoice.id}/line-items`)
        .send({ description: 'Test' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/invoices/:id/line-items/:itemId', () => {
    it('removes line item', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });
      const item = InvoiceService.addLineItem(invoice.id, {
        description: 'Weekly fee',
        quantity: 1,
        unitPrice: 380000,
      });

      const res = await request(app).delete(`/api/invoices/${invoice.id}/line-items/${item.id}`);
      expect(res.status).toBe(204);

      const check = await request(app).get(`/api/invoices/${invoice.id}`);
      expect(check.body.lineItems).toHaveLength(0);
    });
  });

  describe('PATCH /api/invoices/:id/status', () => {
    it('updates status', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });

      const res = await request(app)
        .patch(`/api/invoices/${invoice.id}/status`)
        .send({ status: 'sent' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('sent');
      expect(res.body.sentAt).toBeTruthy();
    });

    it('returns 400 for invalid status', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });

      const res = await request(app)
        .patch(`/api/invoices/${invoice.id}/status`)
        .send({ status: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('allows any valid status transition', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });

      // Transitions were loosened to allow any change (draft → paid included)
      const res = await request(app)
        .patch(`/api/invoices/${invoice.id}/status`)
        .send({ status: 'paid' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('paid');
      expect(res.body.paidAt).toBeTruthy();
    });

    it('returns 404 for non-existent invoice', async () => {
      const res = await request(app).patch('/api/invoices/999/status').send({ status: 'sent' });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/invoices/:id/send', () => {
    it('sends to the stored client email and marks the invoice sent', async () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
        clientEmail: 'ops@companycam.com',
      });
      InvoiceService.addLineItem(invoice.id, {
        description: 'Weekly fee',
        quantity: 1,
        unitPrice: 380000,
      });

      const res = await request(app).post(`/api/invoices/${invoice.id}/send`).send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await request(app).get(`/api/invoices/${invoice.id}`);
      expect(check.body.status).toBe('sent');
      expect(check.body.sentAt).toBeTruthy();
    });

    it('uses and persists a recipient override', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });
      InvoiceService.addLineItem(invoice.id, {
        description: 'Weekly fee',
        quantity: 1,
        unitPrice: 380000,
      });

      const res = await request(app)
        .post(`/api/invoices/${invoice.id}/send`)
        .send({ to: 'billing@companycam.com' });

      expect(res.status).toBe(200);

      const check = await request(app).get(`/api/invoices/${invoice.id}`);
      expect(check.body.clientEmail).toBe('billing@companycam.com');
    });

    it('returns 400 when no recipient is available', async () => {
      const invoice = InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });

      const res = await request(app).post(`/api/invoices/${invoice.id}/send`).send({});

      expect(res.status).toBe(400);
    });

    it('does not downgrade a paid invoice', async () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
        clientEmail: 'ops@companycam.com',
      });
      InvoiceService.addLineItem(invoice.id, {
        description: 'Weekly fee',
        quantity: 1,
        unitPrice: 380000,
      });
      InvoiceService.updateStatus(invoice.id, 'paid');

      const res = await request(app).post(`/api/invoices/${invoice.id}/send`).send({});

      expect(res.status).toBe(200);

      const check = await request(app).get(`/api/invoices/${invoice.id}`);
      expect(check.body.status).toBe('paid');
    });

    it('returns 404 for non-existent invoice', async () => {
      const res = await request(app).post('/api/invoices/999/send').send({ to: 'x@y.com' });

      expect(res.status).toBe(404);
    });
  });

  describe('Templates', () => {
    describe('GET /api/invoices/templates/:client', () => {
      it('returns templates for client', async () => {
        InvoiceService.createTemplate({
          clientName: 'CompanyCam',
          description: 'Weekly fee',
          unitPrice: 380000,
          isDefault: true,
        });

        const res = await request(app).get('/api/invoices/templates/CompanyCam');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
      });
    });

    describe('POST /api/invoices/templates', () => {
      it('creates template', async () => {
        const res = await request(app).post('/api/invoices/templates').send({
          clientName: 'CompanyCam',
          description: 'Weekly fee',
          unitPrice: 380000,
          isDefault: true,
        });

        expect(res.status).toBe(201);
        expect(res.body.description).toBe('Weekly fee');
      });

      it('returns 400 without required fields', async () => {
        const res = await request(app)
          .post('/api/invoices/templates')
          .send({ clientName: 'CompanyCam' });

        expect(res.status).toBe(400);
      });
    });
  });
});
