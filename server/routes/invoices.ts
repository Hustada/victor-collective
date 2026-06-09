/**
 * Invoice API Routes
 */

import { Router } from 'express';
import * as fs from 'fs';
import { InvoiceService } from '../services/invoice.service.js';
import { ClientService } from '../services/client.service.js';
import { PdfService } from '../services/pdf.service.js';
import { EmailService } from '../services/email.service.js';
import { sendRawEmail } from '../services/email-send.service.js';
import { generateInvoiceHtml, InvoiceParams } from '../services/invoice-template.service.js';
import { logger } from '../lib/logger.js';

export const invoiceRoutes = Router();

// List invoices
invoiceRoutes.get('/', (req, res) => {
  const { client, status } = req.query;

  const filters: { clientName?: string; status?: 'draft' | 'sent' | 'paid' } = {};
  if (client) filters.clientName = client as string;
  if (status) filters.status = status as 'draft' | 'sent' | 'paid';

  const invoices = InvoiceService.list(filters);
  res.json(invoices);
});

// Get templates - must be before /:id to avoid matching "templates" as an id
invoiceRoutes.get('/templates/:clientId', (req, res) => {
  const clientId = parseInt(req.params.clientId, 10);
  if (Number.isNaN(clientId)) {
    return res.status(400).json({ error: 'clientId must be a number' });
  }
  const templates = InvoiceService.getTemplates(clientId);
  res.json(templates);
});

// Get invoice with line items
invoiceRoutes.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const invoice = InvoiceService.getById(id);

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const lineItems = InvoiceService.getLineItems(id);
  res.json({ ...invoice, lineItems });
});

// Create invoice
invoiceRoutes.post('/', (req, res) => {
  const { clientId, weekEnding, notes } = req.body;
  let { clientName, clientEmail } = req.body;

  // If a registry client is selected, snapshot its name onto the invoice.
  // Email falls back to the client's, but an explicit override wins.
  if (clientId) {
    const client = ClientService.getById(clientId);
    if (!client) {
      return res.status(400).json({ error: 'Selected client not found' });
    }
    clientName = client.name;
    clientEmail = clientEmail || client.email || undefined;
  }

  if (!clientName) {
    return res.status(400).json({ error: 'clientName is required' });
  }

  if (!weekEnding) {
    return res.status(400).json({ error: 'weekEnding is required' });
  }

  try {
    const invoice = InvoiceService.create({ clientId, clientName, clientEmail, weekEnding, notes });
    res.status(201).json(invoice);
  } catch (error) {
    logger.error('Failed to create invoice', { error });
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Create template
invoiceRoutes.post('/templates', (req, res) => {
  const { clientId, description, unitPrice, isDefault } = req.body;

  if (!clientId || !description || unitPrice === undefined) {
    return res.status(400).json({ error: 'clientId, description, and unitPrice are required' });
  }

  try {
    const template = InvoiceService.createTemplate({
      clientId,
      description,
      unitPrice,
      isDefault,
    });
    res.status(201).json(template);
  } catch (error) {
    logger.error('Failed to create template', { error });
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update invoice
invoiceRoutes.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { clientEmail, weekEnding, notes, emailBody } = req.body;

  try {
    const invoice = InvoiceService.update(id, { clientEmail, weekEnding, notes, emailBody });
    res.json(invoice);
  } catch (error) {
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    logger.error('Failed to update invoice', { id, error });
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Delete invoice
invoiceRoutes.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  InvoiceService.delete(id);
  res.status(204).send();
});

// Add line item
invoiceRoutes.post('/:id/line-items', (req, res) => {
  const invoiceId = parseInt(req.params.id, 10);
  const { description, quantity, unitPrice, isRecurring, sortOrder } = req.body;

  if (!description || quantity === undefined || unitPrice === undefined) {
    return res.status(400).json({ error: 'description, quantity, and unitPrice are required' });
  }

  const invoice = InvoiceService.getById(invoiceId);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  try {
    const item = InvoiceService.addLineItem(invoiceId, {
      description,
      quantity,
      unitPrice,
      isRecurring,
      sortOrder,
    });
    res.status(201).json(item);
  } catch (error) {
    logger.error('Failed to add line item', { invoiceId, error });
    res.status(500).json({ error: 'Failed to add line item' });
  }
});

// Remove line item
invoiceRoutes.delete('/:id/line-items/:itemId', (req, res) => {
  const invoiceId = parseInt(req.params.id, 10);
  const itemId = parseInt(req.params.itemId, 10);

  InvoiceService.removeLineItem(invoiceId, itemId);
  res.status(204).send();
});

// Update status
invoiceRoutes.patch('/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!['draft', 'sent', 'paid'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const invoice = InvoiceService.updateStatus(id, status);
    res.json(invoice);
  } catch (error) {
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    if ((error as Error).message.includes('Cannot transition')) {
      return res.status(400).json({ error: (error as Error).message });
    }
    logger.error('Failed to update status', { id, status, error });
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Send invoice to client: branded HTML body + PDF attachment, then mark sent
invoiceRoutes.post('/:id/send', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const invoice = InvoiceService.getById(id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  // Recipient: explicit override, otherwise the stored client email
  const to = (req.body?.to as string | undefined)?.trim() || invoice.clientEmail;
  if (!to) {
    return res.status(400).json({ error: 'No recipient email. Add a client email first.' });
  }

  // Persist the recipient if it was supplied or changed, so it is remembered
  if (to !== invoice.clientEmail) {
    InvoiceService.update(id, { clientEmail: to });
  }

  try {
    const lineItems = InvoiceService.getLineItems(id);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // DB stores cents; the template renders dollars
    const params: InvoiceParams = {
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.createdAt.split('T')[0],
      dueDate: dueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      clientName: invoice.clientName,
      clientEmail: to,
      items: lineItems.map((item) => ({
        description: item.description,
        amount: item.amount / 100,
      })),
      notes: invoice.notes || undefined,
      paid: invoice.status === 'paid',
    };

    const html = generateInvoiceHtml(params);
    const text = EmailService.generate(id);
    const pdf = await PdfService.generate(id);

    const result = await sendRawEmail({
      to,
      subject: `Invoice ${invoice.invoiceNumber} from The Victor Collective`,
      html,
      text,
      attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdf }],
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Failed to send invoice' });
    }

    // Mark as sent only from draft; never downgrade a paid invoice
    if (invoice.status === 'draft') {
      InvoiceService.updateStatus(id, 'sent');
    }

    logger.info('Invoice sent', {
      id,
      number: invoice.invoiceNumber,
      to,
      emailId: result.id,
    });

    res.json({ success: true, id: result.id });
  } catch (error) {
    logger.error('Failed to send invoice', { id, error: (error as Error).message });
    res.status(500).json({ error: 'Failed to send invoice' });
  }
});

// Generate PDF
invoiceRoutes.post('/:id/generate-pdf', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const invoice = InvoiceService.getById(id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  try {
    const pdfPath = await PdfService.save(id);

    // Also generate email body
    EmailService.save(id);

    res.json({ pdfPath });
  } catch (error) {
    logger.error('Failed to generate PDF', { id, error });
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Download PDF
invoiceRoutes.get('/:id/pdf', (req, res) => {
  const id = parseInt(req.params.id, 10);

  const invoice = InvoiceService.getById(id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
    return res.status(404).json({ error: 'PDF not generated' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
  res.sendFile(invoice.pdfPath);
});
