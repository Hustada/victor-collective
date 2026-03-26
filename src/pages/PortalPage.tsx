import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Collapse,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, PencilSimple, X } from '@phosphor-icons/react';
import PortalGate from '../components/PortalGate';
import DepthCard from '../components/ui/DepthCard';
import {
  PortalEntry,
  ProposalModule,
  EntryCategory,
  loadEntries,
  saveEntries,
} from '../config/proposals';
import { palette } from '../theme';

const categoryLabel: Record<EntryCategory, string> = {
  proposal: 'PROPOSAL',
  idea: 'IDEA',
  plan: 'PLAN',
};

const categoryColor: Record<EntryCategory, string> = {
  proposal: palette.primary.main,
  idea: palette.secondary.main,
  plan: palette.success,
};

const priorityColor: Record<ProposalModule['priority'], string> = {
  'start here': palette.success,
  next: palette.secondary.main,
  later: palette.text.muted,
};

const statusColor: Record<string, string> = {
  draft: palette.text.muted,
  sent: palette.secondary.main,
  accepted: palette.success,
  declined: palette.error,
};

const emptyForm: Omit<PortalEntry, 'id'> = {
  category: 'idea',
  title: '',
  date: new Date().toISOString().split('T')[0],
  body: '',
};

const PortalPage: React.FC = () => {
  const [entries, setEntries] = useState<PortalEntry[]>(loadEntries);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<PortalEntry, 'id'>>(emptyForm);
  const [filter, setFilter] = useState<EntryCategory | 'all'>('all');

  const persist = (updated: PortalEntry[]) => {
    setEntries(updated);
    saveEntries(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingId) {
      const updated = entries.map((entry) =>
        entry.id === editingId ? { ...entry, ...form } : entry
      );
      persist(updated);
      setEditingId(null);
    } else {
      const newEntry: PortalEntry = {
        ...form,
        id: `entry-${Date.now()}`,
      };
      persist([newEntry, ...entries]);
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (entry: PortalEntry) => {
    setForm({
      category: entry.category,
      title: entry.title,
      date: entry.date,
      body: entry.body,
      client: entry.client,
      status: entry.status,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.category === filter);

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
            {'// PORTAL'}
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
              Workspace
            </Typography>

            <Button
              variant="contained"
              startIcon={<Plus size={18} weight="bold" />}
              onClick={() => {
                setForm(emptyForm);
                setEditingId(null);
                setShowForm(!showForm);
              }}
              sx={{ mt: 1 }}
            >
              New Entry
            </Button>
          </Box>

          <Typography variant="body1" sx={{ color: palette.text.muted, mb: 4 }}>
            Ideas, plans, and proposals for The Victor Collective.
          </Typography>

          {/* Filter chips */}
          <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
            {(['all', 'proposal', 'idea', 'plan'] as const).map((cat) => (
              <Chip
                key={cat}
                label={cat === 'all' ? 'ALL' : categoryLabel[cat]}
                size="small"
                onClick={() => setFilter(cat)}
                sx={{
                  backgroundColor:
                    filter === cat
                      ? cat === 'all'
                        ? palette.primary.main
                        : categoryColor[cat]
                      : 'transparent',
                  border: `1px solid ${cat === 'all' ? palette.primary.main : categoryColor[cat]}`,
                  color:
                    filter === cat
                      ? '#000'
                      : cat === 'all'
                        ? palette.primary.main
                        : categoryColor[cat],
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
          <Collapse in={showForm}>
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
                    {editingId ? '// EDIT ENTRY' : '// NEW ENTRY'}
                  </Typography>
                  <IconButton onClick={handleCancel} size="small">
                    <X size={18} color={palette.text.muted} />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      label="Category"
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value as EntryCategory,
                        })
                      }
                    >
                      <MenuItem value="idea">Idea</MenuItem>
                      <MenuItem value="plan">Plan</MenuItem>
                      <MenuItem value="proposal">Proposal</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      autoFocus
                    />
                  </Grid>
                  {form.category === 'proposal' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Client"
                        value={form.client || ''}
                        onChange={(e) => setForm({ ...form, client: e.target.value })}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Body"
                      multiline
                      rows={6}
                      value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" sx={{ px: 4, py: 1.5 }}>
                      {editingId ? 'Save Changes' : 'Add Entry'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </DepthCard>
          </Collapse>

          {/* Entries */}
          <AnimatePresence mode="popLayout">
            {filtered.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <DepthCard sx={{ mb: 3 }}>
                  <Box sx={{ p: 4 }}>
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
                          label={categoryLabel[entry.category]}
                          size="small"
                          sx={{
                            backgroundColor: 'transparent',
                            border: `1px solid ${categoryColor[entry.category]}`,
                            color: categoryColor[entry.category],
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '0.6rem',
                            letterSpacing: '0.1em',
                            borderRadius: 0,
                            height: 22,
                          }}
                        />
                        {entry.status && (
                          <Chip
                            label={entry.status.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: 'transparent',
                              border: `1px solid ${statusColor[entry.status]}`,
                              color: statusColor[entry.status],
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: '0.6rem',
                              letterSpacing: '0.1em',
                              borderRadius: 0,
                              height: 22,
                            }}
                          />
                        )}
                        <Typography variant="caption" sx={{ color: palette.text.muted }}>
                          {entry.date}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleEdit(entry)}>
                          <PencilSimple size={16} color={palette.text.muted} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(entry.id)}>
                          <Trash size={16} color={palette.text.muted} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        color: palette.text.primary,
                        mb: 0.5,
                      }}
                    >
                      {entry.title}
                    </Typography>

                    {entry.client && (
                      <Typography variant="body2" sx={{ color: palette.primary.light, mb: 2 }}>
                        {entry.client}
                      </Typography>
                    )}

                    <Typography
                      variant="body1"
                      sx={{
                        color: palette.text.secondary,
                        lineHeight: 1.8,
                        whiteSpace: 'pre-line',
                        mb: entry.modules ? 4 : 0,
                      }}
                    >
                      {entry.body}
                    </Typography>

                    {/* Proposal modules */}
                    {entry.modules && entry.modules.length > 0 && (
                      <>
                        <Typography
                          variant="overline"
                          sx={{
                            color: palette.primary.main,
                            fontSize: '0.7rem',
                            letterSpacing: '0.15em',
                            display: 'block',
                            mb: 3,
                          }}
                        >
                          {'// MODULES'}
                        </Typography>

                        <Grid container spacing={3}>
                          {entry.modules.map((mod) => (
                            <Grid item xs={12} md={6} key={mod.name}>
                              <Box
                                sx={{
                                  p: 3,
                                  border: `1px solid ${palette.border.subtle}`,
                                  backgroundColor: palette.background.base,
                                  height: '100%',
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
                                  <Chip
                                    label={mod.priority.toUpperCase()}
                                    size="small"
                                    sx={{
                                      backgroundColor: 'transparent',
                                      border: `1px solid ${priorityColor[mod.priority]}`,
                                      color: priorityColor[mod.priority],
                                      fontFamily: '"JetBrains Mono", monospace',
                                      fontSize: '0.55rem',
                                      letterSpacing: '0.1em',
                                      borderRadius: 0,
                                      height: 20,
                                    }}
                                  />
                                  <Typography
                                    variant="h5"
                                    sx={{
                                      fontFamily: '"JetBrains Mono", monospace',
                                      color: palette.text.primary,
                                      fontWeight: 700,
                                    }}
                                  >
                                    ${mod.price.toLocaleString()}
                                  </Typography>
                                </Box>

                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontFamily: '"Space Grotesk", sans-serif',
                                    color: palette.text.primary,
                                    fontWeight: 600,
                                    mb: 1,
                                  }}
                                >
                                  {mod.name}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: palette.text.secondary,
                                    lineHeight: 1.6,
                                    fontSize: '0.85rem',
                                    mb: 1.5,
                                  }}
                                >
                                  {mod.description}
                                </Typography>

                                {mod.hours && (
                                  <Typography variant="caption" sx={{ color: palette.text.muted }}>
                                    Est. {mod.hours}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        <Box
                          sx={{
                            mt: 4,
                            pt: 3,
                            borderTop: `1px solid ${palette.border.subtle}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: palette.text.muted }}>
                            TOTAL (ALL MODULES)
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              color: palette.primary.main,
                              fontWeight: 700,
                            }}
                          >
                            ${entry.modules.reduce((sum, m) => sum + m.price, 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </>
                    )}
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
              No entries yet. Add one above.
            </Typography>
          )}
        </Container>
      </Box>
    </PortalGate>
  );
};

export default PortalPage;
