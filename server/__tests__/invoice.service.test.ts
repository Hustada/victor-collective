import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { useTestDb, closeDb, resetTestDb } from '../lib/db.js';

// Import service after db setup
let InvoiceService: typeof import('../services/invoice.service.js').InvoiceService;

beforeAll(async () => {
  useTestDb();
  const module = await import('../services/invoice.service.js');
  InvoiceService = module.InvoiceService;
});

beforeEach(() => {
  resetTestDb();
});

afterAll(() => {
  closeDb();
});

describe('InvoiceService', () => {
  describe('generateInvoiceNumber', () => {
    it('generates first invoice number for year', () => {
      const number = InvoiceService.generateInvoiceNumber();
      expect(number).toMatch(/^TVC-\d{4}-001$/);
    });

    it('increments invoice number within same year', () => {
      // Create first invoice
      InvoiceService.create({
        clientName: 'Test Client',
        weekEnding: '2026-05-30',
      });

      const number = InvoiceService.generateInvoiceNumber();
      expect(number).toMatch(/^TVC-\d{4}-002$/);
    });

    it('uses current year', () => {
      const year = new Date().getFullYear();
      const number = InvoiceService.generateInvoiceNumber();
      expect(number).toContain(`TVC-${year}`);
    });
  });

  describe('calculateNextFriday', () => {
    it('returns same date if already Friday', () => {
      // May 29, 2026 is a Friday
      const result = InvoiceService.calculateNextFriday(new Date('2026-05-29'));
      expect(result).toBe('2026-05-29');
    });

    it('returns next Friday from Monday', () => {
      // May 25, 2026 is a Monday
      const result = InvoiceService.calculateNextFriday(new Date('2026-05-25'));
      expect(result).toBe('2026-05-29');
    });

    it('returns next Friday from Saturday', () => {
      // May 23, 2026 is a Saturday
      const result = InvoiceService.calculateNextFriday(new Date('2026-05-23'));
      expect(result).toBe('2026-05-29');
    });

    it('returns next Friday from Sunday', () => {
      // May 24, 2026 is a Sunday
      const result = InvoiceService.calculateNextFriday(new Date('2026-05-24'));
      expect(result).toBe('2026-05-29');
    });
  });

  describe('create', () => {
    it('creates invoice with auto-generated number', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      expect(invoice.id).toBe(1);
      expect(invoice.invoiceNumber).toMatch(/^TVC-\d{4}-001$/);
      expect(invoice.clientName).toBe('CompanyCam');
      expect(invoice.status).toBe('draft');
      expect(invoice.subtotal).toBe(0);
      expect(invoice.total).toBe(0);
    });

    it('creates invoice with notes', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
        notes: 'Week of AI vision work',
      });

      expect(invoice.notes).toBe('Week of AI vision work');
    });

    it('applies default templates for client', () => {
      // Create templates first
      InvoiceService.createTemplate({
        clientName: 'CompanyCam',
        description: 'Weekly development fee',
        unitPrice: 380000, // $3800
        isDefault: true,
      });

      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      const items = InvoiceService.getLineItems(invoice.id);
      expect(items).toHaveLength(1);
      expect(items[0].description).toBe('Weekly development fee');
      expect(items[0].amount).toBe(380000);

      // Invoice totals should be updated
      const updated = InvoiceService.getById(invoice.id);
      expect(updated?.subtotal).toBe(380000);
      expect(updated?.total).toBe(380000);
    });
  });

  describe('addLineItem', () => {
    it('adds line item and recalculates totals', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      const item = InvoiceService.addLineItem(invoice.id, {
        description: 'Weekly development fee',
        quantity: 1,
        unitPrice: 380000,
      });

      expect(item.id).toBe(1);
      expect(item.amount).toBe(380000);

      const updated = InvoiceService.getById(invoice.id);
      expect(updated?.subtotal).toBe(380000);
      expect(updated?.total).toBe(380000);
    });

    it('calculates amount from quantity and unit price', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      const item = InvoiceService.addLineItem(invoice.id, {
        description: 'API calls',
        quantity: 1000,
        unitPrice: 50, // $0.50 per call
      });

      expect(item.amount).toBe(50000); // $500
    });

    it('supports fractional quantities', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      const item = InvoiceService.addLineItem(invoice.id, {
        description: 'Hourly work',
        quantity: 2.5,
        unitPrice: 9500, // $95/hr
      });

      expect(item.amount).toBe(23750); // $237.50
    });

    it('marks recurring items', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      const item = InvoiceService.addLineItem(invoice.id, {
        description: 'Claude Code Max',
        quantity: 1,
        unitPrice: 20000,
        isRecurring: true,
      });

      expect(item.isRecurring).toBe(true);
    });
  });

  describe('removeLineItem', () => {
    it('removes line item and recalculates totals', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      const item1 = InvoiceService.addLineItem(invoice.id, {
        description: 'Weekly fee',
        quantity: 1,
        unitPrice: 380000,
      });

      InvoiceService.addLineItem(invoice.id, {
        description: 'Claude Code Max',
        quantity: 1,
        unitPrice: 20000,
      });

      let updated = InvoiceService.getById(invoice.id);
      expect(updated?.total).toBe(400000);

      InvoiceService.removeLineItem(invoice.id, item1.id);

      updated = InvoiceService.getById(invoice.id);
      expect(updated?.total).toBe(20000);
    });
  });

  describe('updateStatus', () => {
    it('transitions from draft to sent', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      const updated = InvoiceService.updateStatus(invoice.id, 'sent');
      expect(updated.status).toBe('sent');
      expect(updated.sentAt).toBeTruthy();
    });

    it('transitions from sent to paid', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      InvoiceService.updateStatus(invoice.id, 'sent');
      const updated = InvoiceService.updateStatus(invoice.id, 'paid');

      expect(updated.status).toBe('paid');
      expect(updated.paidAt).toBeTruthy();
    });

    it('rejects invalid transitions', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      // Can't go from draft to paid
      expect(() => InvoiceService.updateStatus(invoice.id, 'paid')).toThrow();
    });

    it('allows reverting sent to draft', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      InvoiceService.updateStatus(invoice.id, 'sent');
      const updated = InvoiceService.updateStatus(invoice.id, 'draft');

      expect(updated.status).toBe('draft');
      expect(updated.sentAt).toBeFalsy();
    });
  });

  describe('list', () => {
    beforeEach(() => {
      InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-23' });
      InvoiceService.create({ clientName: 'CompanyCam', weekEnding: '2026-05-30' });
      InvoiceService.create({ clientName: 'Other Client', weekEnding: '2026-05-30' });
    });

    it('lists all invoices', () => {
      const invoices = InvoiceService.list();
      expect(invoices).toHaveLength(3);
    });

    it('filters by client', () => {
      const invoices = InvoiceService.list({ clientName: 'CompanyCam' });
      expect(invoices).toHaveLength(2);
    });

    it('filters by status', () => {
      InvoiceService.updateStatus(1, 'sent');
      const invoices = InvoiceService.list({ status: 'sent' });
      expect(invoices).toHaveLength(1);
    });

    it('orders by week_ending desc', () => {
      const invoices = InvoiceService.list({ clientName: 'CompanyCam' });
      expect(invoices[0].weekEnding).toBe('2026-05-30');
      expect(invoices[1].weekEnding).toBe('2026-05-23');
    });
  });

  describe('update', () => {
    it('updates invoice fields', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      const updated = InvoiceService.update(invoice.id, {
        notes: 'Updated notes',
        weekEnding: '2026-05-23',
      });

      expect(updated.notes).toBe('Updated notes');
      expect(updated.weekEnding).toBe('2026-05-23');
    });

    it('throws on non-existent invoice', () => {
      expect(() => InvoiceService.update(999, { notes: 'test' })).toThrow();
    });
  });

  describe('delete', () => {
    it('deletes invoice and line items', () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      InvoiceService.addLineItem(invoice.id, {
        description: 'Weekly fee',
        quantity: 1,
        unitPrice: 380000,
      });

      InvoiceService.delete(invoice.id);

      expect(InvoiceService.getById(invoice.id)).toBeNull();
      expect(InvoiceService.getLineItems(invoice.id)).toHaveLength(0);
    });
  });

  describe('templates', () => {
    it('creates template', () => {
      const template = InvoiceService.createTemplate({
        clientName: 'CompanyCam',
        description: 'Weekly development fee',
        unitPrice: 380000,
        isDefault: true,
      });

      expect(template.id).toBe(1);
      expect(template.isDefault).toBe(true);
    });

    it('gets templates for client', () => {
      InvoiceService.createTemplate({
        clientName: 'CompanyCam',
        description: 'Weekly fee',
        unitPrice: 380000,
        isDefault: true,
      });
      InvoiceService.createTemplate({
        clientName: 'CompanyCam',
        description: 'Claude Code Max',
        unitPrice: 20000,
        isDefault: false,
      });
      InvoiceService.createTemplate({
        clientName: 'Other Client',
        description: 'Something else',
        unitPrice: 10000,
        isDefault: true,
      });

      const templates = InvoiceService.getTemplates('CompanyCam');
      expect(templates).toHaveLength(2);
    });

    it('gets only default templates', () => {
      InvoiceService.createTemplate({
        clientName: 'CompanyCam',
        description: 'Weekly fee',
        unitPrice: 380000,
        isDefault: true,
      });
      InvoiceService.createTemplate({
        clientName: 'CompanyCam',
        description: 'Optional add-on',
        unitPrice: 20000,
        isDefault: false,
      });

      const defaults = InvoiceService.getTemplates('CompanyCam', true);
      expect(defaults).toHaveLength(1);
      expect(defaults[0].description).toBe('Weekly fee');
    });
  });
});
