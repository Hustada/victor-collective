import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeSimple,
  EnvelopeOpen,
  Trash,
  ArrowLeft,
  Circle,
  Paperclip,
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import PortalGate from '../components/PortalGate';
import DepthCard from '../components/ui/DepthCard';
import { palette } from '../theme';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface EmailSummary {
  uid: number;
  subject: string;
  from: { name: string; address: string };
  date: string;
  seen: boolean;
  hasAttachments: boolean;
  preview: string;
}

interface EmailFull extends EmailSummary {
  to: { name: string; address: string }[];
  html: string | null;
  text: string | null;
  attachments: { filename: string; contentType: string; size: number }[];
}

const InboxPage: React.FC = () => {
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/inbox?limit=50`);
      const data = await res.json();
      setEmails(data.emails || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const openEmail = async (uid: number) => {
    try {
      const res = await fetch(`${API_URL}/api/inbox/${uid}`);
      const email = await res.json();
      setSelectedEmail(email);
      // Update local state to mark as seen
      setEmails((prev) => prev.map((e) => (e.uid === uid ? { ...e, seen: true } : e)));
    } catch (err) {
      console.error('Failed to fetch email:', err);
    }
  };

  const deleteEmail = async (uid: number) => {
    if (!window.confirm('Delete this email?')) return;
    try {
      await fetch(`${API_URL}/api/inbox/${uid}`, { method: 'DELETE' });
      setEmails((prev) => prev.filter((e) => e.uid !== uid));
      if (selectedEmail?.uid === uid) {
        setSelectedEmail(null);
      }
    } catch (err) {
      console.error('Failed to delete email:', err);
    }
  };

  const toggleRead = async (uid: number, currentlySeen: boolean) => {
    try {
      const endpoint = currentlySeen ? 'unread' : 'read';
      await fetch(`${API_URL}/api/inbox/${uid}/${endpoint}`, { method: 'PATCH' });
      setEmails((prev) => prev.map((e) => (e.uid === uid ? { ...e, seen: !currentlySeen } : e)));
    } catch (err) {
      console.error('Failed to toggle read status:', err);
    }
  };

  const unreadCount = emails.filter((e) => !e.seen).length;

  return (
    <PortalGate>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: palette.background.base,
          pt: 4,
          pb: 8,
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="overline"
              sx={{
                color: palette.primary.main,
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '0.2em',
              }}
            >
              {'// INBOX'}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                color: palette.text.primary,
                mt: 1,
              }}
            >
              Messages
            </Typography>
            <Typography variant="body2" sx={{ color: palette.text.muted, mt: 1 }}>
              {total} total · {unreadCount} unread
            </Typography>
          </Box>

          {/* Content */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: palette.primary.main }} />
            </Box>
          ) : selectedEmail ? (
            /* Email Detail View */
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DepthCard>
                <Box sx={{ p: 3 }}>
                  {/* Back button */}
                  <Button
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => setSelectedEmail(null)}
                    sx={{
                      color: palette.text.muted,
                      mb: 3,
                      '&:hover': { color: palette.primary.main },
                    }}
                  >
                    Back to inbox
                  </Button>

                  {/* Email header */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 3,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontWeight: 600,
                          color: palette.text.primary,
                          mb: 1,
                        }}
                      >
                        {selectedEmail.subject}
                      </Typography>
                      <Typography variant="body2" sx={{ color: palette.primary.main }}>
                        {selectedEmail.from.name || selectedEmail.from.address}
                      </Typography>
                      <Typography variant="caption" sx={{ color: palette.text.muted }}>
                        {selectedEmail.from.address}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => deleteEmail(selectedEmail.uid)}
                        sx={{
                          color: palette.text.muted,
                          '&:hover': { color: '#ff4444' },
                        }}
                      >
                        <Trash size={20} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: palette.text.muted,
                      fontFamily: '"JetBrains Mono", monospace',
                      display: 'block',
                      mb: 3,
                    }}
                  >
                    {format(new Date(selectedEmail.date), 'PPpp')}
                  </Typography>

                  {/* Attachments */}
                  {selectedEmail.attachments.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      {selectedEmail.attachments.map((att, i) => (
                        <Chip
                          key={i}
                          icon={<Paperclip size={14} />}
                          label={att.filename}
                          size="small"
                          sx={{
                            mr: 1,
                            mb: 1,
                            backgroundColor: palette.background.elevated,
                            color: palette.text.secondary,
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Email body */}
                  <Box
                    sx={{
                      borderTop: `1px solid ${palette.border.subtle}`,
                      pt: 3,
                      '& a': { color: palette.primary.main },
                      '& img': { maxWidth: '100%' },
                    }}
                  >
                    {selectedEmail.html ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                        style={{
                          color: palette.text.secondary,
                          lineHeight: 1.6,
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          color: palette.text.secondary,
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                        }}
                      >
                        {selectedEmail.text}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </DepthCard>
            </motion.div>
          ) : (
            /* Email List View */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <AnimatePresence>
                {emails.map((email, index) => (
                  <motion.div
                    key={email.uid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Box
                      onClick={() => openEmail(email.uid)}
                      sx={{
                        p: 2,
                        backgroundColor: email.seen
                          ? palette.background.base
                          : palette.background.elevated,
                        border: `1px solid ${palette.border.subtle}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: palette.primary.main,
                          backgroundColor: palette.background.elevated,
                        },
                      }}
                    >
                      {/* Unread indicator */}
                      <Box sx={{ width: 24, flexShrink: 0 }}>
                        {!email.seen && (
                          <Circle size={10} weight="fill" color={palette.primary.main} />
                        )}
                      </Box>

                      {/* Email icon */}
                      <Box sx={{ color: palette.text.muted, flexShrink: 0 }}>
                        {email.seen ? (
                          <EnvelopeOpen size={20} />
                        ) : (
                          <EnvelopeSimple size={20} weight="fill" />
                        )}
                      </Box>

                      {/* From */}
                      <Box sx={{ width: 180, flexShrink: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: email.seen ? palette.text.secondary : palette.text.primary,
                            fontWeight: email.seen ? 400 : 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {email.from.name || email.from.address}
                        </Typography>
                      </Box>

                      {/* Subject + Preview */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: email.seen ? palette.text.secondary : palette.text.primary,
                            fontWeight: email.seen ? 400 : 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {email.subject}
                          {email.hasAttachments && (
                            <Paperclip
                              size={14}
                              style={{
                                marginLeft: 8,
                                verticalAlign: 'middle',
                              }}
                            />
                          )}
                        </Typography>
                      </Box>

                      {/* Date */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: palette.text.muted,
                          fontFamily: '"JetBrains Mono", monospace',
                          flexShrink: 0,
                        }}
                      >
                        {format(new Date(email.date), 'MMM d')}
                      </Typography>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          onClick={() => toggleRead(email.uid, email.seen)}
                          sx={{
                            color: palette.text.muted,
                            '&:hover': { color: palette.primary.main },
                          }}
                        >
                          {email.seen ? <EnvelopeSimple size={16} /> : <EnvelopeOpen size={16} />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteEmail(email.uid)}
                          sx={{
                            color: palette.text.muted,
                            '&:hover': { color: '#ff4444' },
                          }}
                        >
                          <Trash size={16} />
                        </IconButton>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>

              {emails.length === 0 && (
                <Typography
                  sx={{
                    color: palette.text.muted,
                    textAlign: 'center',
                    py: 8,
                  }}
                >
                  No emails found.
                </Typography>
              )}
            </Box>
          )}
        </Container>
      </Box>
    </PortalGate>
  );
};

export default InboxPage;
