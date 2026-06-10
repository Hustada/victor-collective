'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, InputBase } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlass,
  EnvelopeSimple,
  Invoice,
  House,
  Article,
  User,
  Lock,
} from '@phosphor-icons/react';
import { palette } from '../theme';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  restricted?: boolean;
}

const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: CommandItem[] = [
    {
      id: 'home',
      label: 'Home',
      description: 'Go to homepage',
      icon: <House size={18} />,
      action: () => router.push('/'),
      keywords: ['main', 'landing'],
    },
    {
      id: 'blog',
      label: 'Blog',
      description: 'Read articles',
      icon: <Article size={18} />,
      action: () => router.push('/blog'),
      keywords: ['posts', 'articles', 'writing'],
    },
    {
      id: 'about',
      label: 'About',
      description: 'Jump to about section',
      icon: <User size={18} />,
      action: () => {
        router.push('/');
        setTimeout(() => {
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      keywords: ['bio', 'info'],
    },
    {
      id: 'portal',
      label: 'Portal',
      description: 'Enter restricted area',
      icon: <Lock size={18} />,
      action: () => router.push('/portal'),
      keywords: ['admin', 'dashboard', 'restricted'],
      restricted: true,
    },
    {
      id: 'inbox',
      label: 'Inbox',
      description: 'View messages',
      icon: <EnvelopeSimple size={18} />,
      action: () => router.push('/inbox'),
      keywords: ['email', 'messages', 'mail'],
      restricted: true,
    },
    {
      id: 'invoices',
      label: 'Invoices',
      description: 'Manage invoices',
      icon: <Invoice size={18} />,
      action: () => router.push('/invoices'),
      keywords: ['billing', 'payments', 'money'],
      restricted: true,
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.keywords?.some((k) => k.includes(q))
    );
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }

      if (!open) return;

      // Close with Escape
      if (e.key === 'Escape') {
        setOpen(false);
      }

      // Navigate with arrows
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      }

      // Execute with Enter
      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        setOpen(false);
      }
    },
    [open, filteredCommands, selectedIndex]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 500,
              zIndex: 9999,
              padding: '0 16px',
            }}
          >
            <Box
              sx={{
                backgroundColor: palette.background.elevated,
                border: `1px solid ${palette.border.subtle}`,
                borderRadius: 0,
                overflow: 'hidden',
                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px ${palette.border.subtle}`,
              }}
            >
              {/* Search input */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderBottom: `1px solid ${palette.border.subtle}`,
                }}
              >
                <MagnifyingGlass size={20} color={palette.text.muted} />
                <InputBase
                  inputRef={inputRef}
                  placeholder="Type a command..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  sx={{
                    flex: 1,
                    color: palette.text.primary,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.95rem',
                    '& input::placeholder': {
                      color: palette.text.muted,
                      opacity: 1,
                    },
                  }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    backgroundColor: palette.background.base,
                    border: `1px solid ${palette.border.subtle}`,
                    borderRadius: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.65rem',
                      color: palette.text.muted,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    ESC
                  </Typography>
                </Box>
              </Box>

              {/* Results */}
              <Box sx={{ maxHeight: 400, overflowY: 'auto', py: 1 }}>
                {filteredCommands.length === 0 ? (
                  <Typography
                    sx={{
                      color: palette.text.muted,
                      textAlign: 'center',
                      py: 4,
                      fontSize: '0.875rem',
                    }}
                  >
                    No results found
                  </Typography>
                ) : (
                  <>
                    {/* Public pages */}
                    {filteredCommands
                      .filter((c) => !c.restricted)
                      .map((cmd) => (
                        <Box
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            setOpen(false);
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            px: 2,
                            py: 1.5,
                            cursor: 'pointer',
                            backgroundColor:
                              filteredCommands.indexOf(cmd) === selectedIndex
                                ? palette.background.base
                                : 'transparent',
                            borderLeft:
                              filteredCommands.indexOf(cmd) === selectedIndex
                                ? `2px solid ${palette.primary.main}`
                                : '2px solid transparent',
                            transition: 'all 0.1s',
                            '&:hover': {
                              backgroundColor: palette.background.base,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              color:
                                filteredCommands.indexOf(cmd) === selectedIndex
                                  ? palette.primary.main
                                  : palette.text.muted,
                            }}
                          >
                            {cmd.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                color:
                                  filteredCommands.indexOf(cmd) === selectedIndex
                                    ? palette.text.primary
                                    : palette.text.secondary,
                                fontSize: '0.9rem',
                                fontWeight: 500,
                              }}
                            >
                              {cmd.label}
                            </Typography>
                            {cmd.description && (
                              <Typography
                                sx={{
                                  color: palette.text.muted,
                                  fontSize: '0.75rem',
                                }}
                              >
                                {cmd.description}
                              </Typography>
                            )}
                          </Box>
                          {filteredCommands.indexOf(cmd) === selectedIndex && (
                            <Typography
                              sx={{
                                fontSize: '0.65rem',
                                color: palette.text.muted,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              ENTER
                            </Typography>
                          )}
                        </Box>
                      ))}

                    {/* Restricted section header */}
                    {filteredCommands.some((c) => c.restricted) && (
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          mt: 1,
                          borderTop: `1px solid ${palette.border.subtle}`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.65rem',
                            color: palette.text.muted,
                            fontFamily: '"JetBrains Mono", monospace',
                            letterSpacing: '0.1em',
                          }}
                        >
                          {'// RESTRICTED'}
                        </Typography>
                      </Box>
                    )}

                    {/* Restricted pages */}
                    {filteredCommands
                      .filter((c) => c.restricted)
                      .map((cmd) => {
                        const cmdIndex = filteredCommands.indexOf(cmd);
                        return (
                          <Box
                            key={cmd.id}
                            onClick={() => {
                              cmd.action();
                              setOpen(false);
                            }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              px: 2,
                              py: 1.5,
                              cursor: 'pointer',
                              backgroundColor:
                                cmdIndex === selectedIndex
                                  ? palette.background.base
                                  : 'transparent',
                              borderLeft:
                                cmdIndex === selectedIndex
                                  ? `2px solid ${palette.primary.main}`
                                  : '2px solid transparent',
                              transition: 'all 0.1s',
                              '&:hover': {
                                backgroundColor: palette.background.base,
                              },
                            }}
                          >
                            <Box
                              sx={{
                                color:
                                  cmdIndex === selectedIndex
                                    ? palette.primary.main
                                    : palette.text.muted,
                              }}
                            >
                              {cmd.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                sx={{
                                  color:
                                    cmdIndex === selectedIndex
                                      ? palette.text.primary
                                      : palette.text.secondary,
                                  fontSize: '0.9rem',
                                  fontWeight: 500,
                                }}
                              >
                                {cmd.label}
                                <Lock
                                  size={12}
                                  style={{
                                    marginLeft: 6,
                                    verticalAlign: 'middle',
                                    opacity: 0.5,
                                  }}
                                />
                              </Typography>
                              {cmd.description && (
                                <Typography
                                  sx={{
                                    color: palette.text.muted,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {cmd.description}
                                </Typography>
                              )}
                            </Box>
                            {cmdIndex === selectedIndex && (
                              <Typography
                                sx={{
                                  fontSize: '0.65rem',
                                  color: palette.text.muted,
                                  fontFamily: '"JetBrains Mono", monospace',
                                }}
                              >
                                ENTER
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                  </>
                )}
              </Box>

              {/* Footer hint */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  p: 1.5,
                  borderTop: `1px solid ${palette.border.subtle}`,
                  backgroundColor: palette.background.base,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: '0.6rem',
                      color: palette.text.muted,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    ↑↓
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: palette.text.muted }}>
                    navigate
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: '0.6rem',
                      color: palette.text.muted,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    ↵
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: palette.text.muted }}>
                    select
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
