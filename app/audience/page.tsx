'use client';

/**
 * Audience — everyone who handed over their email, in one place.
 * Contact-form leads and subscribers from any content surface, attributed by
 * source, with baseline metrics. The inbox is where conversations happen;
 * this is who you've captured.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Paper,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { UsersThree, X } from '@phosphor-icons/react';
import PortalGate from '../../src/components/PortalGate';
import DepthCard from '../../src/components/ui/DepthCard';
import { palette } from '../../src/theme';
import { fadeUp } from '../../src/lib/motion';

interface Subscriber {
  id: number;
  email: string;
  source: string;
  context: string | null;
  tags: string | null;
  created_at: string;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function tagsOf(s: Subscriber): string[] {
  try {
    const parsed = JSON.parse(s.tags ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function relativeAge(iso: string): string {
  const then = new Date(iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`).getTime();
  if (Number.isNaN(then)) return '';
  const days = Math.floor((Date.now() - then) / (24 * 60 * 60 * 1000));
  if (days === 0) return 'today';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  const isNumeric = typeof value === 'number';
  return (
    <Box
      sx={{
        p: 2.5,
        flex: '1 1 150px',
        background: palette.background.elevated,
        border: `1px solid ${palette.border.subtle}`,
        borderRadius: 2,
      }}
    >
      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.58rem',
          letterSpacing: '0.18em',
          color: palette.text.muted,
          textTransform: 'uppercase',
          mb: 0.8,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: isNumeric ? '1.7rem' : '0.8rem',
          fontWeight: isNumeric ? 700 : 500,
          fontFamily: isNumeric ? 'inherit' : '"JetBrains Mono", monospace',
          letterSpacing: isNumeric ? 'normal' : '0.08em',
          color: palette.text.primary,
          lineHeight: isNumeric ? 1.2 : 2.1,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function AudienceContent() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch('/api/subscribers');
      if (!res.ok) throw new Error('API not available');
      setSubscribers(await res.json());
      setApiAvailable(true);
    } catch {
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const prune = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
        if (res.ok) setSubscribers((prev) => prev.filter((s) => s.id !== id));
      } catch {
        // row stays; next refresh reconciles
      }
    },
    [setSubscribers]
  );

  const stats = useMemo(() => {
    const now = Date.now();
    const leads = subscribers.filter((s) => tagsOf(s).includes('lead'));
    const thisWeek = subscribers.filter((s) => {
      const t = new Date(
        s.created_at.includes('T') ? s.created_at : `${s.created_at.replace(' ', 'T')}Z`
      ).getTime();
      return now - t < WEEK_MS;
    });
    const bySource = new Map<string, number>();
    for (const s of subscribers) bySource.set(s.source, (bySource.get(s.source) ?? 0) + 1);
    return { total: subscribers.length, leads: leads.length, thisWeek: thisWeek.length, bySource };
  }, [subscribers]);

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <motion.div {...fadeUp}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            color="primary"
            sx={{ letterSpacing: 2, display: 'block', mb: 1 }}
          >
            Portal
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom>
            Audience
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Everyone who handed over their email — leads from the contact form, signups from
            everywhere else. Attributed by source.
          </Typography>
        </Box>
      </motion.div>

      {!apiAvailable ? (
        <DepthCard sx={{ p: 6, textAlign: 'center' }}>
          <UsersThree size={40} color={palette.text.muted} />
          <Typography sx={{ color: palette.text.secondary, mt: 2 }}>
            API not available — start the server with npm run dev:all
          </Typography>
        </DepthCard>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', mb: 5 }}>
            <Stat label="Total" value={stats.total} />
            <Stat label="Leads" value={stats.leads} />
            <Stat label="This week" value={stats.thisWeek} />
            <Stat
              label="Sources"
              value={
                Array.from(stats.bySource.entries())
                  .map(([k, v]) => `${k} ${v}`)
                  .join(' · ') || '—'
              }
            />
          </Box>

          {subscribers.length === 0 ? (
            <DepthCard sx={{ p: 6, textAlign: 'center' }}>
              <Typography sx={{ color: palette.text.muted }}>
                Nobody captured yet. The contact form and /api/subscribe feed this list.
              </Typography>
            </DepthCard>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                background: palette.background.elevated,
                border: `1px solid ${palette.border.subtle}`,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Email', 'Source', 'Tags', 'Context', 'Captured', ''].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '0.6rem',
                          letterSpacing: '0.15em',
                          color: palette.text.muted,
                          textTransform: 'uppercase',
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscribers.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ color: palette.text.primary, fontWeight: 500 }}>
                        {s.email}
                      </TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '0.62rem',
                            letterSpacing: '0.1em',
                            color: palette.text.secondary,
                          }}
                        >
                          {s.source}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {tagsOf(s).map((t) => (
                          <Typography
                            key={t}
                            component="span"
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: '0.55rem',
                              letterSpacing: '0.12em',
                              color: palette.primary.main,
                              border: `1px solid ${palette.primary.main}55`,
                              borderRadius: '4px',
                              px: 0.7,
                              py: 0.2,
                              mr: 0.5,
                              textTransform: 'uppercase',
                            }}
                          >
                            {t}
                          </Typography>
                        ))}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: palette.text.muted,
                          fontSize: '0.78rem',
                          maxWidth: 360,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.context || '—'}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '0.62rem',
                          color: palette.text.muted,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {relativeAge(s.created_at)}
                      </TableCell>
                      <TableCell align="right" sx={{ width: 40 }}>
                        <IconButton
                          size="small"
                          aria-label={`Remove ${s.email}`}
                          onClick={() => prune(s.id)}
                          sx={{ color: palette.text.muted, '&:hover': { color: '#FF4D4D' } }}
                        >
                          <X size={14} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Container>
  );
}

export default function AudiencePage() {
  return (
    <PortalGate>
      <AudienceContent />
    </PortalGate>
  );
}
