import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, PaperPlaneTilt } from '@phosphor-icons/react';
import { alpha } from '@mui/material/styles';
import emailjs from '@emailjs/browser';
import { palette } from '../theme';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    emailjs.init('LOfBCNYKVmwoQ10nV');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      await emailjs.send(
        'service_na22lkl',
        'template_geuplen',
        { subscriber_email: email },
        'LOfBCNYKVmwoQ10nV'
      );

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Email send failed:', error);
      setStatus('error');
      setErrorMessage('Failed to subscribe. Please try again.');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setEmail('');
    setErrorMessage('');
  };

  return (
    <Box
      sx={{
        py: 12,
        px: 4,
        background: `linear-gradient(180deg, ${palette.background.base} 0%, ${alpha(palette.primary.main, 0.05)} 50%, ${palette.background.base} 100%)`,
        borderTop: `1px solid ${palette.border.subtle}`,
        borderBottom: `1px solid ${palette.border.subtle}`,
        position: 'relative',
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  py: 4,
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle
                    size={64}
                    color={palette.primary.main}
                    weight="duotone"
                  />
                </motion.div>

                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    color: 'text.primary',
                  }}
                >
                  You're In
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', maxWidth: 400 }}
                >
                  Thanks for subscribing. You'll receive updates on new projects and insights.
                </Typography>

                <Button
                  variant="outlined"
                  onClick={resetForm}
                  sx={{ mt: 2 }}
                >
                  Subscribe Another Email
                </Button>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: palette.primary.main,
                  fontSize: '0.75rem',
                  letterSpacing: '0.2em',
                  display: 'block',
                  mb: 2,
                }}
              >
                {'// SUBSCRIBE'}
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  color: 'text.primary',
                  mb: 2,
                }}
              >
                Stay in the Loop
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 6,
                  maxWidth: 500,
                  mx: 'auto',
                }}
              >
                Get notified about new projects, blog posts, and insights. No spam, unsubscribe anytime.
              </Typography>

              {/* Email input with sharp styling */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: 'flex',
                  maxWidth: 500,
                  mx: 'auto',
                  border: `2px solid ${palette.border.default}`,
                  transition: 'all 0.3s ease',
                  '&:focus-within': {
                    borderColor: palette.primary.main,
                    boxShadow: `0 0 30px ${palette.primary.glow}`,
                  },
                }}
              >
                <TextField
                  fullWidth
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      px: 2,
                      py: 1.5,
                      fontFamily: '"Inter", sans-serif',
                    },
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      color: 'text.primary',
                      '&::placeholder': {
                        color: palette.text.muted,
                        opacity: 1,
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={status === 'loading'}
                  sx={{
                    px: 4,
                    borderRadius: 0,
                    boxShadow: 'none',
                    minWidth: 140,
                    '&:hover': {
                      boxShadow: 'none',
                    },
                  }}
                >
                  {status === 'loading' ? (
                    <CircularProgress size={24} sx={{ color: 'inherit' }} />
                  ) : (
                    <>
                      Subscribe
                      <PaperPlaneTilt
                        size={18}
                        weight="bold"
                        style={{ marginLeft: 8 }}
                      />
                    </>
                  )}
                </Button>
              </Box>

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      mt: 3,
                      maxWidth: 500,
                      mx: 'auto',
                      borderRadius: 0,
                    }}
                  >
                    {errorMessage}
                  </Alert>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default Newsletter;
