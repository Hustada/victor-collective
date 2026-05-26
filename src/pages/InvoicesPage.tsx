import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Chip, Button, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FilePdf, PaperPlaneTilt, CheckCircle } from '@phosphor-icons/react';
import PortalGate from '../components/PortalGate';
import DepthCard from '../components/ui/DepthCard';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';
import { palette } from '../theme';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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

const statusColor: Record<Invoice['status'], string> = {
  draft: palette.text.muted,
  sent: palette.secondary.main,
  paid: palette.success,
};

const statusLabel: Record<Invoice['status'], string> = {
  draft: 'DRAFT',
  sent: 'SENT',
  paid: 'PAID',
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<Invoice['status'] | 'all'>('all');

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/invoices`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/invoices/templates/CompanyCam`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchTemplates();
  }, []);

  const handleInvoiceClick = async (invoice: Invoice) => {
    // Fetch full invoice with line items
    try {
      const res = await fetch(`${API_URL}/api/invoices/${invoice.id}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewInvoice(data);
      }
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
    }
  };

  const handleStatusChange = async (invoiceId: number, newStatus: Invoice['status']) => {
    try {
      const res = await fetch(`${API_URL}/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchInvoices();
        if (previewInvoice?.id === invoiceId) {
          const updated = await res.json();
          setPreviewInvoice((prev) => (prev ? { ...prev, ...updated } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingInvoice(null);
    fetchInvoices();
  };

  const handleDelete = async (invoiceId: number) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      const res = await fetch(`${API_URL}/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPreviewInvoice(null);
        fetchInvoices();
      }
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  };

  const filtered = filter === 'all' ? invoices : invoices.filter((i) => i.status === filter);

  const stats = {
    draft: invoices.filter((i) => i.status === 'draft').length,
    sent: invoices.filter((i) => i.status === 'sent').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    total: invoices.reduce((sum, i) => sum + i.total, 0),
  };

  if (loading) {
    return (
      <PortalGate>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </PortalGate>
    );
  }

  return (
    <PortalGate>
      <Box
        sx={{
          minHeight: '100vh',
          pt: 16,
          pb: 8,
          backgroundColor: palette.background.base,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{
              color: palette.primary.main,
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              display: 'block',
              mb: 1,
            }}
          >
            {'// INVOICES'}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                color: palette.text.primary,
              }}
            >
              Billing
            </Typography>

            <Button
              variant="contained"
              startIcon={<Plus size={18} weight="bold" />}
              onClick={() => {
                setEditingInvoice(null);
                setShowForm(!showForm);
              }}
              sx={{ mt: 1 }}
            >
              New Invoice
            </Button>
          </Box>

          <Typography variant="body1" sx={{ color: palette.text.muted, mb: 4 }}>
            Manage invoices for The Victor Collective.
          </Typography>

          {/* Stats cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  p: 2,
                  border: `1px solid ${palette.border.subtle}`,
                  backgroundColor: palette.background.elevated,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: palette.text.muted,
                    fontSize: '0.6rem',
                    letterSpacing: '0.15em',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  DRAFT
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: palette.text.muted,
                  }}
                >
                  {stats.draft}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  p: 2,
                  border: `1px solid ${palette.secondary.main}40`,
                  backgroundColor: palette.background.elevated,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: palette.secondary.main,
                    fontSize: '0.6rem',
                    letterSpacing: '0.15em',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  AWAITING PAYMENT
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: palette.secondary.main,
                  }}
                >
                  {stats.sent}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  p: 2,
                  border: `1px solid ${palette.success}40`,
                  backgroundColor: palette.background.elevated,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: palette.success,
                    fontSize: '0.6rem',
                    letterSpacing: '0.15em',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  PAID
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: palette.success,
                  }}
                >
                  {stats.paid}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  p: 2,
                  border: `1px solid ${palette.primary.main}40`,
                  backgroundColor: palette.background.elevated,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: palette.primary.main,
                    fontSize: '0.6rem',
                    letterSpacing: '0.15em',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  TOTAL BILLED
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: palette.primary.main,
                  }}
                >
                  {formatCurrency(stats.total)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Filter chips */}
          <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
            {(['all', 'draft', 'sent', 'paid'] as const).map((status) => (
              <Chip
                key={status}
                label={status === 'all' ? 'ALL' : statusLabel[status]}
                size="small"
                onClick={() => setFilter(status)}
                sx={{
                  backgroundColor:
                    filter === status
                      ? status === 'all'
                        ? palette.primary.main
                        : statusColor[status]
                      : 'transparent',
                  border: `1px solid ${status === 'all' ? palette.primary.main : statusColor[status]}`,
                  color:
                    filter === status
                      ? '#000'
                      : status === 'all'
                        ? palette.primary.main
                        : statusColor[status],
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  borderRadius: 0,
                  height: 26,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              />
            ))}
          </Box>

          {/* Create/Edit form */}
          {showForm && (
            <InvoiceForm
              invoice={editingInvoice}
              templates={templates}
              onClose={() => {
                setShowForm(false);
                setEditingInvoice(null);
              }}
              onSubmit={handleFormSubmit}
              apiUrl={API_URL}
            />
          )}

          {/* Invoices list */}
          <AnimatePresence mode="popLayout">
            {filtered.map((invoice) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <DepthCard
                  sx={{ mb: 3, cursor: 'pointer' }}
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  <Box sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Chip
                          label={statusLabel[invoice.status]}
                          size="small"
                          icon={
                            invoice.status === 'draft' ? (
                              <FilePdf size={12} />
                            ) : invoice.status === 'sent' ? (
                              <PaperPlaneTilt size={12} />
                            ) : (
                              <CheckCircle size={12} />
                            )
                          }
                          sx={{
                            backgroundColor: 'transparent',
                            border: `1px solid ${statusColor[invoice.status]}`,
                            color: statusColor[invoice.status],
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '0.6rem',
                            letterSpacing: '0.1em',
                            borderRadius: 0,
                            height: 22,
                            '& .MuiChip-icon': {
                              color: statusColor[invoice.status],
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: palette.text.muted }}>
                          Week ending {invoice.weekEnding}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: palette.text.primary,
                        }}
                      >
                        {formatCurrency(invoice.total)}
                      </Typography>
                    </Box>

                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        color: palette.text.primary,
                        mb: 0.5,
                      }}
                    >
                      {invoice.invoiceNumber}
                    </Typography>

                    <Typography variant="body2" sx={{ color: palette.primary.light }}>
                      {invoice.clientName}
                    </Typography>
                  </Box>
                </DepthCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <Typography
              variant="body1"
              sx={{
                color: palette.text.muted,
                textAlign: 'center',
                py: 8,
              }}
            >
              No invoices found. Create one above.
            </Typography>
          )}
        </Container>
      </Box>

      {/* Preview modal */}
      {previewInvoice && (
        <InvoicePreview
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          onEdit={() => {
            setEditingInvoice(previewInvoice);
            setShowForm(true);
            setPreviewInvoice(null);
          }}
          onDelete={() => handleDelete(previewInvoice.id)}
          onStatusChange={(status) => handleStatusChange(previewInvoice.id, status)}
          apiUrl={API_URL}
        />
      )}
    </PortalGate>
  );
};

export default InvoicesPage;
