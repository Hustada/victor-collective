import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { useTestDb, closeDb, resetTestDb } from '../lib/db.js';

let InvoiceService: typeof import('../services/invoice.service.js').InvoiceService;
let PdfService: typeof import('../services/pdf.service.js').PdfService;

beforeAll(async () => {
  useTestDb();
  const invoiceModule = await import('../services/invoice.service.js');
  const pdfModule = await import('../services/pdf.service.js');
  InvoiceService = invoiceModule.InvoiceService;
  PdfService = pdfModule.PdfService;
});

beforeEach(() => {
  resetTestDb();
});

afterAll(() => {
  closeDb();
});

describe('PdfService', () => {
  describe('formatCurrency', () => {
    it('formats positive cents to dollars', () => {
      expect(PdfService.formatCurrency(100)).toBe('$1.00');
      expect(PdfService.formatCurrency(380000)).toBe('$3,800.00');
      expect(PdfService.formatCurrency(9950)).toBe('$99.50');
    });

    it('formats negative cents to dollars', () => {
      expect(PdfService.formatCurrency(-100)).toBe('-$1.00');
      expect(PdfService.formatCurrency(-5000)).toBe('-$50.00');
    });

    it('formats zero', () => {
      expect(PdfService.formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('generate', () => {
    it('generates valid PDF buffer', async () => {
      const invoice = InvoiceService.create({
        clientName: 'CompanyCam',
        weekEnding: '2026-05-30',
      });

      InvoiceService.addLineItem(invoice.id, {
        description: 'Weekly development fee',
        quantity: 1,
        unitPrice: 380000,
      });

      const buffer = await PdfService.generate(invoice.id);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      // PDF magic bytes: %PDF
      expect(buffer.slice(0, 4).toString()).toBe('%PDF');
    });

    it('throws for non-existent invoice', async () => {
      await expect(PdfService.generate(999)).rejects.toThrow();
    });
  });
});
