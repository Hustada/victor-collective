/**
 * Email Service
 *
 * Generate professional email body for invoices
 */

import { InvoiceService } from './invoice.service.js';
import { PdfService } from './pdf.service.js';
import { getDb } from '../lib/db.js';
import { logger } from '../lib/logger.js';

export const EmailService = {
  /**
   * Generate email body for an invoice
   */
  generate(invoiceId: number): string {
    const invoice = InvoiceService.getById(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    const lineItems = InvoiceService.getLineItems(invoiceId);

    const itemLines = lineItems
      .map((item) => `  • ${item.description}: ${PdfService.formatCurrency(item.amount)}`)
      .join('\n');

    const body = `Hi,

Please find attached invoice ${invoice.invoiceNumber} for the week ending ${invoice.weekEnding}.

Summary:
${itemLines}

Total: ${PdfService.formatCurrency(invoice.total)}

${invoice.notes ? `Notes: ${invoice.notes}\n\n` : ''}Let me know if you have any questions.

Best,
Mark

---
The Victor Collective LLC
AI & Automation Consulting`;

    logger.debug('Email body generated', {
      invoiceId,
      number: invoice.invoiceNumber,
    });

    return body;
  },

  /**
   * Generate and save email body to invoice
   */
  save(invoiceId: number): string {
    const body = this.generate(invoiceId);
    const db = getDb();
    db.prepare('UPDATE invoices SET email_body = ? WHERE id = ?').run(body, invoiceId);
    return body;
  },
};
