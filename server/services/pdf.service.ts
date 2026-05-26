/**
 * PDF Service
 *
 * Generate professional invoices as PDF
 */

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { InvoiceService } from './invoice.service.js';
import { logger } from '../lib/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INVOICES_DIR = path.join(__dirname, '..', 'data', 'pdfs');

// Ensure invoices directory exists
if (!fs.existsSync(INVOICES_DIR)) {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
}

export const PdfService = {
  /**
   * Format cents to dollar string
   */
  formatCurrency(cents: number): string {
    const isNegative = cents < 0;
    const absCents = Math.abs(cents);
    const dollars = absCents / 100;
    const formatted = dollars.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isNegative ? `-$${formatted}` : `$${formatted}`;
  },

  /**
   * Generate PDF buffer for an invoice
   */
  async generate(invoiceId: number): Promise<Buffer> {
    const invoice = InvoiceService.getById(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    const lineItems = InvoiceService.getLineItems(invoiceId);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'right' });
      doc.fontSize(10).font('Helvetica').text(invoice.invoiceNumber, { align: 'right' });
      doc.moveDown(2);

      // Company info (left side)
      doc.fontSize(14).font('Helvetica-Bold').text('The Victor Collective LLC');
      doc.fontSize(10).font('Helvetica');
      doc.text('AI & Automation Consulting');
      doc.moveDown();

      // Bill To
      doc.font('Helvetica-Bold').text('Bill To:');
      doc.font('Helvetica').text(invoice.clientName);
      doc.moveDown();

      // Invoice details
      doc.font('Helvetica-Bold').text('Invoice Details');
      doc.font('Helvetica');
      doc.text(`Week Ending: ${invoice.weekEnding}`);
      doc.text(`Status: ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}`);
      doc.text(`Date Issued: ${invoice.createdAt.split('T')[0]}`);
      doc.moveDown(2);

      // Line items table
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 350;
      const col3 = 420;
      const col4 = 490;

      // Table header
      doc.font('Helvetica-Bold');
      doc.text('Description', col1, tableTop);
      doc.text('Qty', col2, tableTop);
      doc.text('Rate', col3, tableTop);
      doc.text('Amount', col4, tableTop);

      // Underline
      doc.moveTo(col1, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table rows
      doc.font('Helvetica');
      let y = tableTop + 25;

      for (const item of lineItems) {
        doc.text(item.description, col1, y, { width: 290 });
        doc.text(item.quantity.toString(), col2, y);
        doc.text(this.formatCurrency(item.unitPrice), col3, y);
        doc.text(this.formatCurrency(item.amount), col4, y);
        y += 20;
      }

      // Totals
      y += 20;
      doc.moveTo(col3, y).lineTo(550, y).stroke();
      y += 10;

      doc.font('Helvetica-Bold');
      doc.text('Subtotal:', col3, y);
      doc.text(this.formatCurrency(invoice.subtotal), col4, y);
      y += 20;

      doc.fontSize(12);
      doc.text('Total:', col3, y);
      doc.text(this.formatCurrency(invoice.total), col4, y);

      // Notes
      if (invoice.notes) {
        doc.moveDown(4);
        doc.fontSize(10).font('Helvetica-Bold').text('Notes:');
        doc.font('Helvetica').text(invoice.notes);
      }

      // Footer
      doc.fontSize(8);
      doc.text(
        'Thank you for your business.',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.end();
    });
  },

  /**
   * Generate and save PDF to file
   */
  async save(invoiceId: number): Promise<string> {
    const invoice = InvoiceService.getById(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    const buffer = await this.generate(invoiceId);
    const filename = `${invoice.invoiceNumber}.pdf`;
    const filepath = path.join(INVOICES_DIR, filename);

    fs.writeFileSync(filepath, buffer);

    // Update invoice with PDF path
    InvoiceService.setPdfPath(invoiceId, filepath);

    logger.info('PDF generated', {
      id: invoiceId,
      number: invoice.invoiceNumber,
      path: filepath,
    });

    return filepath;
  },

  /**
   * Get PDF path for an invoice
   */
  getPdfPath(invoiceId: number): string | null {
    const invoice = InvoiceService.getById(invoiceId);
    return invoice?.pdfPath || null;
  },
};
