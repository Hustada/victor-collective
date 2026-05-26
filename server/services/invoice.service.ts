/**
 * Invoice Service
 *
 * Business logic for invoice management
 */

import { getDb } from '../lib/db.js';
import { logger } from '../lib/logger.js';

// Types
export interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  weekEnding: string;
  status: 'draft' | 'sent' | 'paid';
  subtotal: number;
  total: number;
  notes: string | null;
  pdfPath: string | null;
  emailBody: string | null;
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isRecurring: boolean;
  sortOrder: number;
}

export interface InvoiceTemplate {
  id: number;
  clientName: string;
  description: string;
  unitPrice: number;
  isDefault: boolean;
  createdAt: string;
}

interface CreateInvoiceInput {
  clientName: string;
  weekEnding: string;
  notes?: string;
}

interface CreateLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  isRecurring?: boolean;
  sortOrder?: number;
}

interface CreateTemplateInput {
  clientName: string;
  description: string;
  unitPrice: number;
  isDefault?: boolean;
}

interface ListFilters {
  clientName?: string;
  status?: 'draft' | 'sent' | 'paid';
}

interface UpdateInvoiceInput {
  weekEnding?: string;
  notes?: string;
  emailBody?: string;
}

// Row types from database
interface InvoiceRow {
  id: number;
  invoice_number: string;
  client_name: string;
  week_ending: string;
  status: string;
  subtotal: number;
  total: number;
  notes: string | null;
  pdf_path: string | null;
  email_body: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LineItemRow {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  is_recurring: number;
  sort_order: number;
}

interface TemplateRow {
  id: number;
  client_name: string;
  description: string;
  unit_price: number;
  is_default: number;
  created_at: string;
}

// Mappers
function mapInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    clientName: row.client_name,
    weekEnding: row.week_ending,
    status: row.status as Invoice['status'],
    subtotal: row.subtotal,
    total: row.total,
    notes: row.notes,
    pdfPath: row.pdf_path,
    emailBody: row.email_body,
    sentAt: row.sent_at,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLineItem(row: LineItemRow): LineItem {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    description: row.description,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    amount: row.amount,
    isRecurring: Boolean(row.is_recurring),
    sortOrder: row.sort_order,
  };
}

function mapTemplate(row: TemplateRow): InvoiceTemplate {
  return {
    id: row.id,
    clientName: row.client_name,
    description: row.description,
    unitPrice: row.unit_price,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
  };
}

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent'],
  sent: ['paid', 'draft'],
  paid: ['sent'], // Allow reverting if payment was incorrect
};

export const InvoiceService = {
  /**
   * Generate next invoice number: TVC-YYYY-NNN
   */
  generateInvoiceNumber(): string {
    const db = getDb();
    const year = new Date().getFullYear();
    const prefix = `TVC-${year}-`;

    const lastInvoice = db.prepare(
      `SELECT invoice_number FROM invoices
       WHERE invoice_number LIKE ?
       ORDER BY invoice_number DESC LIMIT 1`
    ).get(`${prefix}%`) as { invoice_number: string } | undefined;

    let nextNum = 1;
    if (lastInvoice) {
      const lastNum = parseInt(lastInvoice.invoice_number.slice(-3), 10);
      nextNum = lastNum + 1;
    }

    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  },

  /**
   * Calculate next Friday from a given date
   * Uses UTC to avoid timezone issues
   */
  calculateNextFriday(date: Date = new Date()): string {
    // Use UTC to avoid timezone shifting
    const day = date.getUTCDay();
    let daysUntilFriday: number;

    if (day === 5) {
      // Already Friday
      daysUntilFriday = 0;
    } else if (day === 6) {
      // Saturday → next Friday is 6 days away
      daysUntilFriday = 6;
    } else if (day === 0) {
      // Sunday → next Friday is 5 days away
      daysUntilFriday = 5;
    } else {
      // Monday-Thursday → days until this Friday
      daysUntilFriday = 5 - day;
    }

    const nextFriday = new Date(date);
    nextFriday.setUTCDate(date.getUTCDate() + daysUntilFriday);

    return nextFriday.toISOString().split('T')[0];
  },

  /**
   * Create a new invoice
   */
  create(input: CreateInvoiceInput): Invoice {
    const db = getDb();
    const invoiceNumber = this.generateInvoiceNumber();

    const stmt = db.prepare(`
      INSERT INTO invoices (invoice_number, client_name, week_ending, status, subtotal, total, notes)
      VALUES (?, ?, ?, 'draft', 0, 0, ?)
    `);

    const result = stmt.run(
      invoiceNumber,
      input.clientName,
      input.weekEnding,
      input.notes || null
    );

    const invoiceId = result.lastInsertRowid as number;

    logger.info('Invoice created', {
      id: invoiceId,
      number: invoiceNumber,
      client: input.clientName,
    });

    // Apply default templates
    const templates = this.getTemplates(input.clientName, true);
    for (const template of templates) {
      this.addLineItem(invoiceId, {
        description: template.description,
        quantity: 1,
        unitPrice: template.unitPrice,
        isRecurring: false,
      });
    }

    return this.getById(invoiceId)!;
  },

  /**
   * Get invoice by ID
   */
  getById(id: number): Invoice | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id) as InvoiceRow | undefined;
    return row ? mapInvoice(row) : null;
  },

  /**
   * List invoices with optional filters
   */
  list(filters?: ListFilters): Invoice[] {
    const db = getDb();
    let query = 'SELECT * FROM invoices WHERE 1=1';
    const params: unknown[] = [];

    if (filters?.clientName) {
      query += ' AND client_name = ?';
      params.push(filters.clientName);
    }

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY week_ending DESC, id DESC';

    const rows = db.prepare(query).all(...params) as InvoiceRow[];
    return rows.map(mapInvoice);
  },

  /**
   * Update invoice fields
   */
  update(id: number, input: UpdateInvoiceInput): Invoice {
    const db = getDb();
    const existing = this.getById(id);

    if (!existing) {
      throw new Error(`Invoice ${id} not found`);
    }

    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.weekEnding !== undefined) {
      updates.push('week_ending = ?');
      params.push(input.weekEnding);
    }

    if (input.notes !== undefined) {
      updates.push('notes = ?');
      params.push(input.notes);
    }

    if (input.emailBody !== undefined) {
      updates.push('email_body = ?');
      params.push(input.emailBody);
    }

    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`).run(...params);

      logger.debug('Invoice updated', { id, updates: Object.keys(input) });
    }

    return this.getById(id)!;
  },

  /**
   * Delete an invoice
   */
  delete(id: number): void {
    const db = getDb();
    const invoice = this.getById(id);

    if (invoice) {
      db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
      logger.info('Invoice deleted', { id, number: invoice.invoiceNumber });
    }
  },

  /**
   * Update invoice status with validation
   */
  updateStatus(id: number, newStatus: 'draft' | 'sent' | 'paid'): Invoice {
    const db = getDb();
    const invoice = this.getById(id);

    if (!invoice) {
      throw new Error(`Invoice ${id} not found`);
    }

    const allowed = VALID_TRANSITIONS[invoice.status];
    if (!allowed?.includes(newStatus)) {
      logger.warn('Invalid status transition', {
        id,
        from: invoice.status,
        to: newStatus,
      });
      throw new Error(`Cannot transition from ${invoice.status} to ${newStatus}`);
    }

    const updates: string[] = ['status = ?'];
    const params: unknown[] = [newStatus];

    if (newStatus === 'sent') {
      updates.push('sent_at = ?');
      params.push(new Date().toISOString());
    } else if (newStatus === 'paid') {
      updates.push('paid_at = ?');
      params.push(new Date().toISOString());
    } else if (newStatus === 'draft') {
      // Clear timestamps when reverting
      updates.push('sent_at = NULL', 'paid_at = NULL');
    }

    params.push(id);
    db.prepare(`UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    logger.info('Invoice status updated', {
      id,
      number: invoice.invoiceNumber,
      from: invoice.status,
      to: newStatus,
    });

    return this.getById(id)!;
  },

  /**
   * Add line item to invoice
   */
  addLineItem(invoiceId: number, input: CreateLineItemInput): LineItem {
    const db = getDb();
    const amount = Math.round(input.quantity * input.unitPrice);

    const stmt = db.prepare(`
      INSERT INTO line_items (invoice_id, description, quantity, unit_price, amount, is_recurring, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      invoiceId,
      input.description,
      input.quantity,
      input.unitPrice,
      amount,
      input.isRecurring ? 1 : 0,
      input.sortOrder ?? 0
    );

    this.recalculateTotals(invoiceId);

    logger.debug('Line item added', {
      invoiceId,
      description: input.description,
      amount,
    });

    const row = db.prepare('SELECT * FROM line_items WHERE id = ?').get(
      result.lastInsertRowid
    ) as LineItemRow;

    return mapLineItem(row);
  },

  /**
   * Remove line item from invoice
   */
  removeLineItem(invoiceId: number, itemId: number): void {
    const db = getDb();
    db.prepare('DELETE FROM line_items WHERE id = ? AND invoice_id = ?').run(itemId, invoiceId);
    this.recalculateTotals(invoiceId);

    logger.debug('Line item removed', { invoiceId, itemId });
  },

  /**
   * Get line items for an invoice
   */
  getLineItems(invoiceId: number): LineItem[] {
    const db = getDb();
    const rows = db.prepare(
      'SELECT * FROM line_items WHERE invoice_id = ? ORDER BY sort_order, id'
    ).all(invoiceId) as LineItemRow[];

    return rows.map(mapLineItem);
  },

  /**
   * Recalculate invoice totals from line items
   */
  recalculateTotals(invoiceId: number): void {
    const db = getDb();
    const result = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM line_items WHERE invoice_id = ?'
    ).get(invoiceId) as { total: number };

    const total = result.total;

    db.prepare('UPDATE invoices SET subtotal = ?, total = ? WHERE id = ?').run(
      total,
      total,
      invoiceId
    );

    logger.debug('Totals recalculated', { invoiceId, total });
  },

  /**
   * Set PDF path on invoice
   */
  setPdfPath(invoiceId: number, pdfPath: string): void {
    const db = getDb();
    db.prepare('UPDATE invoices SET pdf_path = ? WHERE id = ?').run(pdfPath, invoiceId);
  },

  /**
   * Create a line item template
   */
  createTemplate(input: CreateTemplateInput): InvoiceTemplate {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO invoice_templates (client_name, description, unit_price, is_default)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.clientName,
      input.description,
      input.unitPrice,
      input.isDefault ? 1 : 0
    );

    logger.info('Template created', {
      id: result.lastInsertRowid,
      client: input.clientName,
      description: input.description,
    });

    const row = db.prepare('SELECT * FROM invoice_templates WHERE id = ?').get(
      result.lastInsertRowid
    ) as TemplateRow;

    return mapTemplate(row);
  },

  /**
   * Get templates for a client
   */
  getTemplates(clientName: string, defaultOnly = false): InvoiceTemplate[] {
    const db = getDb();
    let query = 'SELECT * FROM invoice_templates WHERE client_name = ?';
    const params: unknown[] = [clientName];

    if (defaultOnly) {
      query += ' AND is_default = 1';
    }

    query += ' ORDER BY id';

    const rows = db.prepare(query).all(...params) as TemplateRow[];
    return rows.map(mapTemplate);
  },
};
