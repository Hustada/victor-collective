/**
 * Invoice API Routes
 */

import { Router } from 'express';
import * as fs from 'fs';
import { InvoiceService } from '../services/invoice.service.js';
import { PdfService } from '../services/pdf.service.js';
import { EmailService } from '../services/email.service.js';
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
invoiceRoutes.get('/templates/:client', (req, res) => {
  const { client } = req.params;
  const templates = InvoiceService.getTemplates(client);
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
  const { clientName, weekEnding, notes } = req.body;

  if (!clientName) {
    return res.status(400).json({ error: 'clientName is required' });
  }

  if (!weekEnding) {
    return res.status(400).json({ error: 'weekEnding is required' });
  }

  try {
    const invoice = InvoiceService.create({ clientName, weekEnding, notes });
    res.status(201).json(invoice);
  } catch (error) {
    logger.error('Failed to create invoice', { error });
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Create template
invoiceRoutes.post('/templates', (req, res) => {
  const { clientName, description, unitPrice, isDefault } = req.body;

  if (!clientName || !description || unitPrice === undefined) {
    return res.status(400).json({ error: 'clientName, description, and unitPrice are required' });
  }

  try {
    const template = InvoiceService.createTemplate({
      clientName,
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
  const { weekEnding, notes, emailBody } = req.body;

  try {
    const invoice = InvoiceService.update(id, { weekEnding, notes, emailBody });
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
