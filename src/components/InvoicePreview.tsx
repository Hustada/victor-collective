'use client';

import React, { useState } from 'react';
import { Box, Typography, Grid, Button, IconButton, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import {
  X,
  Download,
  PencilSimple,
  PaperPlaneTilt,
  CheckCircle,
  Copy,
  Check,
  FilePdf,
  Trash,
} from '@phosphor-icons/react';
import { palette } from '../theme';

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

interface Props {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Invoice['status']) => void;
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

const InvoicePreview: React.FC<Props> = ({
  invoice,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    if (!invoice.pdfPath) {
      // Generate first
      setGenerating(true);
      try {
        await fetch(`/api/invoices/${invoice.id}/generate-pdf`, { method: 'POST' });
      } catch (err) {
        console.error('Failed to generate PDF:', err);
        setGenerating(false);
        return;
      }
      setGenerating(false);
    }
    window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
  };

  const handleCopyEmail = async () => {
    if (!invoice.emailBody) {
      // Generate first
      try {
        await fetch(`/api/invoices/${invoice.id}/generate-pdf`, { method: 'POST' });
        // Refetch invoice to get email body
        const res = await fetch(`/api/invoices/${invoice.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.emailBody) {
            await navigator.clipboard.writeText(data.emailBody);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        }
      } catch (err) {
        console.error('Failed to copy email:', err);
      }
    } else {
      await navigator.clipboard.writeText(invoice.emailBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        p: 2,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto' }}
      >
        <Box
          sx={{
            backgroundColor: palette.background.elevated,
            border: `1px solid ${palette.border.subtle}`,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              p: 3,
              borderBottom: `1px solid ${palette.border.subtle}`,
            }}
          >
            <Box>
              <Typography
                variant="h4"
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
            <IconButton onClick={onClose} size="small">
              <X size={20} color={palette.text.muted} />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            {/* Status and details */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
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
                  STATUS
                </Typography>
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
                    height: 24,
                    '& .MuiChip-icon': {
                      color: statusColor[invoice.status],
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
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
                  WEEK ENDING
                </Typography>
                <Typography variant="body2" sx={{ color: palette.text.primary }}>
                  {invoice.weekEnding}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
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
                  CREATED
                </Typography>
                <Typography variant="body2" sx={{ color: palette.text.primary }}>
                  {invoice.createdAt.split('T')[0]}
                </Typography>
              </Grid>
              {invoice.sentAt && (
                <Grid item xs={6} sm={3}>
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
                    SENT
                  </Typography>
                  <Typography variant="body2" sx={{ color: palette.text.primary }}>
                    {invoice.sentAt.split('T')[0]}
                  </Typography>
                </Grid>
              )}
              {invoice.paidAt && (
                <Grid item xs={6} sm={3}>
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
                    PAID
                  </Typography>
                  <Typography variant="body2" sx={{ color: palette.success }}>
                    {invoice.paidAt.split('T')[0]}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Line items */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="overline"
                sx={{
                  color: palette.primary.main,
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  display: 'block',
                  mb: 2,
                }}
              >
                {'// LINE ITEMS'}
              </Typography>

              {invoice.lineItems?.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    mb: 1,
                    border: `1px solid ${palette.border.subtle}`,
                    backgroundColor: palette.background.base,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ color: palette.text.primary }}>
                      {item.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: palette.text.muted }}>
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: palette.text.primary,
                    }}
                  >
                    {formatCurrency(item.amount)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Total */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 2,
                borderTop: `1px solid ${palette.border.subtle}`,
                mb: 3,
              }}
            >
              <Typography variant="caption" sx={{ color: palette.text.muted }}>
                TOTAL
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: palette.primary.main,
                }}
              >
                {formatCurrency(invoice.total)}
              </Typography>
            </Box>

            {/* Notes */}
            {invoice.notes && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: palette.text.muted,
                    fontSize: '0.6rem',
                    letterSpacing: '0.15em',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  NOTES
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: palette.text.secondary, whiteSpace: 'pre-wrap' }}
                >
                  {invoice.notes}
                </Typography>
              </Box>
            )}

            {/* Email preview */}
            {invoice.emailBody && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: palette.primary.main,
                    fontSize: '0.65rem',
                    letterSpacing: '0.15em',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  {'// EMAIL PREVIEW'}
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    border: `1px solid ${palette.border.subtle}`,
                    backgroundColor: palette.background.base,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.75rem',
                    color: palette.text.secondary,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {invoice.emailBody}
                </Box>
              </Box>
            )}
          </Box>

          {/* Footer actions */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 3,
              borderTop: `1px solid ${palette.border.subtle}`,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Download size={16} />}
                onClick={handleDownloadPdf}
                disabled={generating}
                sx={{
                  borderColor: palette.border.default,
                  color: palette.text.secondary,
                  '&:hover': {
                    borderColor: palette.primary.main,
                    color: palette.primary.light,
                  },
                }}
              >
                {generating ? 'Generating...' : 'PDF'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={handleCopyEmail}
                sx={{
                  borderColor: palette.border.default,
                  color: copied ? palette.success : palette.text.secondary,
                  '&:hover': {
                    borderColor: palette.primary.main,
                    color: palette.primary.light,
                  },
                }}
              >
                {copied ? 'Copied!' : 'Copy Email'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Trash size={16} />}
                onClick={onDelete}
                sx={{
                  borderColor: palette.border.default,
                  color: palette.text.muted,
                  '&:hover': {
                    borderColor: '#ff4444',
                    color: '#ff4444',
                  },
                }}
              >
                Delete
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PencilSimple size={16} />}
                onClick={onEdit}
                sx={{
                  borderColor: palette.border.default,
                  color: palette.text.secondary,
                  '&:hover': {
                    borderColor: palette.primary.main,
                    color: palette.primary.light,
                  },
                }}
              >
                Edit
              </Button>

              {invoice.status === 'draft' && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PaperPlaneTilt size={16} />}
                  onClick={() => onStatusChange('sent')}
                  sx={{
                    backgroundColor: palette.secondary.main,
                    color: '#000',
                    '&:hover': {
                      backgroundColor: palette.secondary.light,
                    },
                  }}
                >
                  Mark Sent
                </Button>
              )}

              {invoice.status === 'sent' && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircle size={16} />}
                  onClick={() => onStatusChange('paid')}
                  sx={{
                    backgroundColor: palette.success,
                    color: '#000',
                    '&:hover': {
                      backgroundColor: '#00dd77',
                    },
                  }}
                >
                  Mark Paid
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default InvoicePreview;
