'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Paper,
  Grid,
} from '@mui/material';
import { Plus, Receipt, Clock, CheckCircle, CurrencyDollar } from '@phosphor-icons/react';
import PortalGate from '../../src/components/PortalGate';
import DepthCard from '../../src/components/ui/DepthCard';
import InvoiceForm from '../../src/components/InvoiceForm';
import InvoicePreview from '../../src/components/InvoicePreview';
import { palette } from '../../src/theme';

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isRecurring: boolean;
}

interface Invoice {
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
  lineItems?: LineItem[];
}

interface InvoiceTemplate {
  id: number;
  clientName: string;
  description: string;
  unitPrice: number;
  isDefault: boolean;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

const statusColors: Record<string, 'default' | 'warning' | 'success'> = {
  draft: 'default',
  sent: 'warning',
  paid: 'success',
};

function InvoicesContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/invoices`);
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/invoices/templates/CompanyCam`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch {
      // Templates are optional
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchInvoices();
    fetchTemplates();
  }, [fetchInvoices, fetchTemplates]);

  const stats = {
    draft: invoices.filter((i) => i.status === 'draft').length,
    sent: invoices.filter((i) => i.status === 'sent').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
  };

  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    setShowForm(true);
    setShowPreview(false);
  };

  const handleRowClick = async (invoice: Invoice) => {
    try {
      const res = await fetch(`${apiUrl}/api/invoices/${invoice.id}`);
      if (res.ok) {
        const fullInvoice = await res.json();
        setSelectedInvoice(fullInvoice);
        setShowPreview(true);
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error loading invoice:', err);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedInvoice(null);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSelectedInvoice(null);
    fetchInvoices();
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setSelectedInvoice(null);
  };

  const handleEdit = () => {
    setShowPreview(false);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;
    try {
      await fetch(`${apiUrl}/api/invoices/${selectedInvoice.id}`, { method: 'DELETE' });
      setShowPreview(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err) {
      console.error('Error deleting invoice:', err);
    }
  };

  const handleStatusChange = () => {
    fetchInvoices();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Make sure the API server is running at {apiUrl}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}
      >
        <Box>
          <Typography
            variant="overline"
            color="primary"
            sx={{ letterSpacing: 2, display: 'block', mb: 1 }}
          >
            Portal
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom>
            Invoices
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus weight="bold" />} onClick={handleNewInvoice}>
          New Invoice
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <DepthCard shadowOffset={4} hoverLift={2}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Receipt size={32} color={palette.text.secondary} />
              <Box>
                <Typography variant="h4">{stats.draft}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Drafts
                </Typography>
              </Box>
            </Box>
          </DepthCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <DepthCard shadowOffset={4} hoverLift={2}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Clock size={32} color={palette.warning} />
              <Box>
                <Typography variant="h4">{stats.sent}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Awaiting Payment
                </Typography>
              </Box>
            </Box>
          </DepthCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <DepthCard shadowOffset={4} hoverLift={2}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircle size={32} color={palette.success} />
              <Box>
                <Typography variant="h4">{stats.paid}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Paid
                </Typography>
              </Box>
            </Box>
          </DepthCard>
        </Grid>
      </Grid>

      {/* Invoice Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Week Ending</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CurrencyDollar
                    size={48}
                    color={palette.text.secondary}
                    style={{ marginBottom: 8 }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    No invoices yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click &ldquo;New Invoice&rdquo; to create your first invoice
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  hover
                  onClick={() => handleRowClick(invoice)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {invoice.invoiceNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{invoice.weekEnding}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      size="small"
                      color={statusColors[invoice.status]}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontFamily="monospace">{formatCurrency(invoice.total)}</Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form Modal */}
      {showForm && (
        <InvoiceForm
          invoice={selectedInvoice}
          templates={templates}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          apiUrl={apiUrl}
        />
      )}

      {/* Preview Modal */}
      {showPreview && selectedInvoice && (
        <InvoicePreview
          invoice={selectedInvoice}
          onClose={handlePreviewClose}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          apiUrl={apiUrl}
        />
      )}
    </Container>
  );
}

export default function InvoicesPage() {
  return (
    <PortalGate>
      <InvoicesContent />
    </PortalGate>
  );
}
