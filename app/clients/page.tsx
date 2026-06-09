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
  CircularProgress,
  Paper,
  IconButton,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Plus, UsersThree, X, Trash, PlugsConnected } from '@phosphor-icons/react';
import PortalGate from '../../src/components/PortalGate';
import DepthCard from '../../src/components/ui/DepthCard';
import { palette } from '../../src/theme';

interface Client {
  id: number;
  name: string;
  email: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function ClientsContent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('API not available');
      setClients(await res.json());
      setApiAvailable(true);
    } catch {
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const openNew = () => {
    setEditing(null);
    setName('');
    setEmail('');
    setNotes('');
    setError(null);
    setShowForm(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setName(client.name);
    setEmail(client.email || '');
    setNotes(client.notes || '');
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = editing ? `/api/clients/${editing.id}` : '/api/clients';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), notes: notes.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save client');
      }
      closeForm();
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client: Client) => {
    try {
      await fetch(`/api/clients/${client.id}`, { method: 'DELETE' });
      fetchClients();
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
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

  if (!apiAvailable) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="overline"
            color="primary"
            sx={{ letterSpacing: 2, display: 'block', mb: 1 }}
          >
            Portal
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom>
            Clients
          </Typography>
        </Box>
        <DepthCard shadowOffset={6} hoverLift={0}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              px: 4,
              textAlign: 'center',
            }}
          >
            <PlugsConnected size={64} color={palette.text.muted} style={{ marginBottom: 24 }} />
            <Typography variant="h5" gutterBottom>
              API Server Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              Client management requires the API server to be running.
            </Typography>
          </Box>
        </DepthCard>
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
            Clients
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus weight="bold" />} onClick={openNew}>
          New Client
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right" sx={{ width: 80 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <UsersThree
                    size={48}
                    color={palette.text.secondary}
                    style={{ marginBottom: 8 }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    No clients yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click &ldquo;New Client&rdquo; to add your first client
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell onClick={() => openEdit(client)}>{client.name}</TableCell>
                  <TableCell onClick={() => openEdit(client)}>
                    {client.email || <span style={{ color: palette.text.muted }}>—</span>}
                  </TableCell>
                  <TableCell onClick={() => openEdit(client)}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 280,
                      }}
                    >
                      {client.notes || ''}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleDelete(client)}>
                      <Trash size={16} color={palette.text.muted} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showForm && (
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
          onClick={closeForm}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 520 }}
          >
            <DepthCard shadowOffset={8} hoverLift={0}>
              <Box sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography variant="h5">{editing ? 'Edit Client' : 'New Client'}</Typography>
                  <IconButton onClick={closeForm} size="small">
                    <X size={20} color={palette.text.muted} />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                    placeholder="CompanyCam"
                  />
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={saving}
                    placeholder="billing@client.com"
                    helperText="Used as the default recipient when invoicing"
                  />
                  <TextField
                    label="Notes"
                    fullWidth
                    multiline
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={saving}
                  />

                  {error && (
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={closeForm} disabled={saving}>
                      Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Client'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </DepthCard>
          </motion.div>
        </Box>
      )}
    </Container>
  );
}

export default function ClientsPage() {
  return (
    <PortalGate>
      <ClientsContent />
    </PortalGate>
  );
}
