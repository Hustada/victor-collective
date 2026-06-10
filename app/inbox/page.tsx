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
  Grid,
  IconButton,
  TextField,
  Skeleton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PencilSimple,
  Envelope,
  EnvelopeOpen,
  Trash,
  PaperPlaneTilt,
  X,
  ArrowClockwise,
  PlugsConnected,
  EnvelopeSimple,
} from '@phosphor-icons/react';
import PortalGate from '../../src/components/PortalGate';
import DepthCard from '../../src/components/ui/DepthCard';
import { palette } from '../../src/theme';

interface EmailAddress {
  name?: string;
  address: string;
}

interface Email {
  uid: number;
  from: EmailAddress;
  to: EmailAddress[];
  subject: string;
  date: string;
  preview?: string;
  seen: boolean;
  body?: string;
  html?: string;
}

interface EmailListResponse {
  emails: Email[];
  total: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatSender(from: EmailAddress): string {
  return from.name || from.address;
}

// Modal overlay component
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InboxContent() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [total, setTotal] = useState(0);

  // Detail modal state
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Compose modal state
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Actions
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchEmails = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/inbox?folder=INBOX&limit=50');
      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.status}`);
      }
      const data: EmailListResponse = await response.json();
      setEmails(data.emails);
      setTotal(data.total);
      setApiAvailable(true);
    } catch (err) {
      console.error('Failed to fetch inbox:', err);
      setApiAvailable(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const fetchEmailDetail = async (uid: number) => {
    setLoadingDetail(true);
    setShowDetail(true);

    try {
      const response = await fetch(`/api/inbox/${uid}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch email: ${response.status}`);
      }
      const email: Email = await response.json();
      setSelectedEmail(email);

      // Mark as read if it was unread
      const originalEmail = emails.find((e) => e.uid === uid);
      if (originalEmail && !originalEmail.seen) {
        await fetch(`/api/inbox/${uid}/read`, { method: 'PATCH' });
        setEmails((prev) => prev.map((e) => (e.uid === uid ? { ...e, seen: true } : e)));
      }
    } catch (err) {
      console.error('Failed to fetch email detail:', { uid, error: err });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleMarkUnread = async (uid: number) => {
    setActionLoading(uid);
    try {
      const response = await fetch(`/api/inbox/${uid}/unread`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark as unread');

      setEmails((prev) => prev.map((e) => (e.uid === uid ? { ...e, seen: false } : e)));
      setShowDetail(false);
    } catch (err) {
      console.error('Failed to mark as unread:', { uid, error: err });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (uid: number) => {
    setActionLoading(uid);
    try {
      const response = await fetch(`/api/inbox/${uid}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete email');

      setEmails((prev) => prev.filter((e) => e.uid !== uid));
      setTotal((prev) => prev - 1);
      setShowDetail(false);
    } catch (err) {
      console.error('Failed to delete email:', { uid, error: err });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSend = async () => {
    if (!composeTo || !composeSubject || !composeBody) {
      setSendError('Please fill in all fields');
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      const response = await fetch('/api/inbox/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      console.log('Email sent successfully:', { id: data.id });
      setSendSuccess(true);
      setTimeout(() => {
        setShowCompose(false);
        resetCompose();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      console.error('Failed to send email:', {
        to: composeTo,
        subject: composeSubject,
        error: errorMessage,
      });
      setSendError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const resetCompose = () => {
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setSendError(null);
    setSendSuccess(false);
  };

  const unreadCount = emails.filter((e) => !e.seen).length;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // API not available
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
            Inbox
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
              Email inbox requires the API server to be running. Start the server to view and send
              emails.
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
            Inbox
          </Typography>
          <Typography variant="body2" color="text.secondary">
            victorhustad@victorcollective.com
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={
              refreshing ? <CircularProgress size={16} /> : <ArrowClockwise weight="bold" />
            }
            onClick={() => fetchEmails(true)}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PencilSimple weight="bold" />}
            onClick={() => {
              resetCompose();
              setShowCompose(true);
            }}
          >
            Compose
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <DepthCard shadowOffset={4} hoverLift={2}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Envelope size={32} color={palette.text.secondary} />
              <Box>
                <Typography variant="h4">{total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
              </Box>
            </Box>
          </DepthCard>
        </Grid>
        <Grid item xs={12} sm={6}>
          <DepthCard shadowOffset={4} hoverLift={2}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <EnvelopeSimple size={32} color={palette.primary.main} />
              <Box>
                <Typography variant="h4">{unreadCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Unread
                </Typography>
              </Box>
            </Box>
          </DepthCard>
        </Grid>
      </Grid>

      {/* Email Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 200 }}>From</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell sx={{ width: 100 }} align="right">
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                  <Envelope size={48} color={palette.text.secondary} style={{ marginBottom: 8 }} />
                  <Typography variant="body1" color="text.secondary">
                    Your inbox is empty
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              emails.map((email) => (
                <TableRow
                  key={email.uid}
                  hover
                  onClick={() => fetchEmailDetail(email.uid)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: !email.seen ? 'rgba(211, 84, 0, 0.05)' : 'transparent',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {!email.seen && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: palette.primary.main,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: !email.seen ? 600 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 180,
                        }}
                      >
                        {formatSender(email.from)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: !email.seen ? 600 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {email.subject || '(No subject)'}
                    </Typography>
                    {email.preview && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {email.preview}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(email.date)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Email Detail Modal */}
      {showDetail && (
        <ModalOverlay onClose={() => setShowDetail(false)}>
          <DepthCard shadowOffset={8} hoverLift={0}>
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">
                  {loadingDetail ? (
                    <Skeleton width={300} />
                  ) : (
                    selectedEmail?.subject || '(No subject)'
                  )}
                </Typography>
                <IconButton onClick={() => setShowDetail(false)}>
                  <X size={24} />
                </IconButton>
              </Box>

              {loadingDetail ? (
                <Box sx={{ py: 4 }}>
                  <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
                  <Skeleton width="40%" height={24} sx={{ mb: 1 }} />
                  <Skeleton width="50%" height={24} sx={{ mb: 3 }} />
                  <Skeleton height={200} />
                </Box>
              ) : selectedEmail ? (
                <>
                  <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${palette.border.subtle}` }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>From:</strong>{' '}
                      {selectedEmail.from.name && <>{selectedEmail.from.name} &lt;</>}
                      {selectedEmail.from.address}
                      {selectedEmail.from.name && <>&#62;</>}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>To:</strong>{' '}
                      {selectedEmail.to.map((t) => t.name || t.address).join(', ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date:</strong> {new Date(selectedEmail.date).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      maxHeight: 400,
                      overflow: 'auto',
                      mb: 3,
                      p: 2,
                      backgroundColor: palette.background.overlay,
                      border: `1px solid ${palette.border.subtle}`,
                    }}
                  >
                    {selectedEmail.html ? (
                      <div
                        style={{ color: palette.text.primary }}
                        dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', m: 0 }}
                      >
                        {selectedEmail.body || '(No content)'}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<EnvelopeOpen size={18} />}
                      onClick={() => handleMarkUnread(selectedEmail.uid)}
                      disabled={actionLoading === selectedEmail.uid}
                    >
                      Mark Unread
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={
                        actionLoading === selectedEmail.uid ? (
                          <CircularProgress size={18} />
                        ) : (
                          <Trash size={18} />
                        )
                      }
                      onClick={() => handleDelete(selectedEmail.uid)}
                      disabled={actionLoading === selectedEmail.uid}
                    >
                      Delete
                    </Button>
                  </Box>
                </>
              ) : null}
            </Box>
          </DepthCard>
        </ModalOverlay>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <ModalOverlay
          onClose={() => {
            setShowCompose(false);
            resetCompose();
          }}
        >
          <DepthCard shadowOffset={8} hoverLift={0}>
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h5">Compose Email</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send from victorhustad@victorcollective.com
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => {
                    setShowCompose(false);
                    resetCompose();
                  }}
                >
                  <X size={24} />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="To"
                  type="email"
                  fullWidth
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  disabled={sending}
                  placeholder="recipient@example.com"
                />

                <TextField
                  label="Subject"
                  fullWidth
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  disabled={sending}
                  placeholder="Email subject"
                />

                <TextField
                  label="Message"
                  fullWidth
                  multiline
                  rows={8}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  disabled={sending}
                  placeholder="Write your message..."
                />

                {sendError && (
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'rgba(255, 51, 102, 0.1)',
                      border: `1px solid ${palette.error}`,
                    }}
                  >
                    <Typography variant="body2" color="error">
                      {sendError}
                    </Typography>
                  </Box>
                )}

                {sendSuccess && (
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'rgba(0, 255, 136, 0.1)',
                      border: `1px solid ${palette.success}`,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: palette.success }}>
                      Email sent successfully!
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowCompose(false);
                      resetCompose();
                    }}
                    disabled={sending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={
                      sending ? <CircularProgress size={18} /> : <PaperPlaneTilt weight="bold" />
                    }
                    onClick={handleSend}
                    disabled={sending || sendSuccess}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </DepthCard>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default function InboxPage() {
  return (
    <PortalGate>
      <InboxContent />
    </PortalGate>
  );
}
