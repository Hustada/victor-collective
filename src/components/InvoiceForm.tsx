'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Chip,
  MenuItem,
} from '@mui/material';
import { X, Plus, Trash } from '@phosphor-icons/react';
import DepthCard from './ui/DepthCard';
import { palette } from '../theme';

interface LineItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isRecurring: boolean;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number | null;
  clientName: string;
  clientEmail: string | null;
  weekEnding: string;
  status: 'draft' | 'sent' | 'paid';
  subtotal: number;
  total: number;
  notes: string | null;
  lineItems?: LineItem[];
}

interface Client {
  id: number;
  name: string;
  email: string | null;
}

interface InvoiceTemplate {
  id: number;
  clientName: string;
  description: string;
  unitPrice: number;
  isDefault: boolean;
}

interface Props {
  invoice: Invoice | null;
  templates: InvoiceTemplate[];
  onClose: () => void;
  onSubmit: () => void;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function getNextFriday(): string {
  const today = new Date();
  const day = today.getUTCDay();
  let daysUntilFriday: number;

  if (day === 5) {
    daysUntilFriday = 0;
  } else if (day === 6) {
    daysUntilFriday = 6;
  } else if (day === 0) {
    daysUntilFriday = 5;
  } else {
    daysUntilFriday = 5 - day;
  }

  const nextFriday = new Date(today);
  nextFriday.setUTCDate(today.getUTCDate() + daysUntilFriday);
  return nextFriday.toISOString().split('T')[0];
}

const InvoiceForm: React.FC<Props> = ({ invoice, templates, onClose, onSubmit }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<number | ''>(invoice?.clientId ?? '');
  const [clientName, setClientName] = useState(invoice?.clientName || '');
  const [clientEmail, setClientEmail] = useState(invoice?.clientEmail || '');
  const [weekEnding, setWeekEnding] = useState(invoice?.weekEnding || getNextFriday());
  const [notes, setNotes] = useState(invoice?.notes || '');
  const [lineItems, setLineItems] = useState<LineItem[]>(invoice?.lineItems || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (invoice?.lineItems) {
      setLineItems(invoice.lineItems);
    }
  }, [invoice]);

  // Load the client registry; default a new invoice to the first client
  useEffect(() => {
    fetch('/api/clients')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Client[]) => {
        setClients(data);
        if (!invoice && data.length > 0) {
          setClientId(data[0].id);
          setClientName(data[0].name);
          setClientEmail(data[0].email || '');
        }
      })
      .catch(() => {});
  }, [invoice]);

  const handleClientChange = (id: number) => {
    setClientId(id);
    const client = clients.find((c) => c.id === id);
    if (client) {
      setClientName(client.name);
      setClientEmail(client.email || '');
    }
  };

  const handleAddFromTemplate = (template: InvoiceTemplate) => {
    const newItem: LineItem = {
      description: template.description,
      quantity: 1,
      unitPrice: template.unitPrice,
      amount: template.unitPrice,
      isRecurring: false,
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const handleAddCustomItem = () => {
    const newItem: LineItem = {
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      isRecurring: false,
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof LineItem,
    value: string | number | boolean
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    // Recalculate amount
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].amount = Math.round(updated[index].quantity * updated[index].unitPrice);
    }

    setLineItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...lineItems];
    updated.splice(index, 1);
    setLineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (invoice) {
        // Update existing invoice
        await fetch(`/api/invoices/${invoice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weekEnding, notes, clientEmail }),
        });

        // Sync line items - delete existing, add new
        for (const item of invoice.lineItems || []) {
          await fetch(`/api/invoices/${invoice.id}/line-items/${item.id}`, {
            method: 'DELETE',
          });
        }

        for (const item of lineItems) {
          await fetch(`/api/invoices/${invoice.id}/line-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });
        }
      } else {
        // Create new invoice
        const res = await fetch(`/api/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: clientId || undefined,
            clientName,
            weekEnding,
            notes,
            clientEmail,
          }),
        });

        if (res.ok) {
          const newInvoice = await res.json();

          // Add line items
          for (const item of lineItems) {
            await fetch(`/api/invoices/${newInvoice.id}/line-items`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            });
          }
        }
      }

      onSubmit();
    } catch (err) {
      console.error('Failed to save invoice:', err);
    } finally {
      setSaving(false);
    }
  };

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <DepthCard sx={{ mb: 4 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: palette.primary.main,
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
            }}
          >
            {invoice ? '// EDIT INVOICE' : '// NEW INVOICE'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X size={18} color={palette.text.muted} />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {invoice ? (
              <TextField fullWidth label="Client" value={clientName} disabled />
            ) : clients.length > 0 ? (
              <TextField
                select
                fullWidth
                label="Client"
                value={clientId}
                onChange={(e) => handleClientChange(Number(e.target.value))}
              >
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                fullWidth
                label="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                helperText="No clients yet — add them in the Clients page"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Week Ending (Friday)"
              type="date"
              value={weekEnding}
              onChange={(e) => setWeekEnding(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Client Email"
              type="email"
              placeholder="client@example.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              helperText="Used when sending the invoice"
            />
          </Grid>

          {/* Templates */}
          <Grid item xs={12}>
            <Box
              sx={{
                mt: 1,
                pt: 2,
                borderTop: `1px solid ${palette.border.subtle}`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: palette.primary.main,
                    fontSize: '0.65rem',
                    letterSpacing: '0.15em',
                  }}
                >
                  {'// LINE ITEMS'}
                </Typography>
                <Button
                  size="small"
                  startIcon={<Plus size={14} weight="bold" />}
                  onClick={handleAddCustomItem}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Add Custom
                </Button>
              </Box>

              {/* Template chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {templates.map((template) => (
                  <Chip
                    key={template.id}
                    label={`${template.description} (${formatCurrency(template.unitPrice)})`}
                    size="small"
                    onClick={() => handleAddFromTemplate(template)}
                    sx={{
                      backgroundColor: 'transparent',
                      border: `1px solid ${palette.border.default}`,
                      color: palette.text.secondary,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.6rem',
                      letterSpacing: '0.05em',
                      borderRadius: 0,
                      height: 24,
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: palette.primary.main,
                        color: palette.primary.light,
                      },
                    }}
                  />
                ))}
              </Box>

              {/* Line items */}
              {lineItems.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: `1px solid ${palette.border.subtle}`,
                    backgroundColor: palette.background.base,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: palette.text.muted }}>
                      ITEM {idx + 1}
                    </Typography>
                    <IconButton size="small" onClick={() => handleRemoveItem(idx)}>
                      <Trash size={14} color={palette.text.muted} />
                    </IconButton>
                  </Box>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Description"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Qty"
                        type="number"
                        inputProps={{ step: 0.5, min: 0 }}
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Unit Price (¢)"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          height: '100%',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: palette.text.primary,
                          }}
                        >
                          {formatCurrency(item.amount)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {lineItems.length === 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: palette.text.muted,
                    textAlign: 'center',
                    py: 4,
                  }}
                >
                  No line items. Click a template above or add a custom item.
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>

          {/* Total and submit */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 2,
                borderTop: `1px solid ${palette.border.subtle}`,
              }}
            >
              <Box>
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
                  {formatCurrency(total)}
                </Typography>
              </Box>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || lineItems.length === 0}
                sx={{ px: 4, py: 1.5 }}
              >
                {saving ? 'Saving...' : invoice ? 'Save Changes' : 'Create Invoice'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </DepthCard>
  );
};

export default InvoiceForm;
