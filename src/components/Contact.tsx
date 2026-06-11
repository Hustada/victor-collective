'use client';

import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Grid, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
  CheckCircle,
  PaperPlaneTilt,
  CalendarBlank,
} from '@phosphor-icons/react';
import SectionHeader from './ui/SectionHeader';
import ContactLink from './ContactLink';
import { palette } from '../theme';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: '',
    company: '', // honeypot — humans never see it, bots fill it
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Relayed by our own server (Resend) straight into the classified inbox.
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: formData.from_name,
          email: formData.from_email,
          message: formData.message,
          company: formData.company,
        }),
      });
      if (!res.ok) throw new Error(`relay returned ${res.status}`);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again or email directly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({ from_name: '', from_email: '', message: '', company: '' });
  };

  return (
    <Box
      id="contact"
      sx={{
        py: 16,
        backgroundColor: palette.background.base,
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
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
                  py: 8,
                  maxWidth: 500,
                  mx: 'auto',
                  textAlign: 'center',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle size={80} color={palette.primary.main} weight="duotone" />
                </motion.div>

                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    color: 'text.primary',
                  }}
                >
                  Message Sent
                </Typography>

                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Thanks for reaching out. I&apos;ll get back to you as soon as possible.
                </Typography>

                <Button variant="outlined" onClick={handleReset} sx={{ mt: 2 }}>
                  Send Another Message
                </Button>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Grid container spacing={8}>
                {/* Left side - Contact info */}
                <Grid item xs={12} md={5}>
                  <SectionHeader
                    number="04"
                    title="Contact"
                    subtitle="Start a conversation about your AI project"
                  />

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                      lineHeight: 1.8,
                    }}
                  >
                    I&apos;m looking for people who see the inflection point and want to build at it
                    — not talk about it. If you have an AI problem worth solving, let&apos;s talk.
                  </Typography>

                  <Button
                    variant="contained"
                    size="large"
                    href="mailto:victorhustad@victorcollective.com?subject=Call%20request&body=A%20few%20times%20that%20work%20for%20me%3A%20"
                    startIcon={<CalendarBlank size={20} weight="bold" />}
                    sx={{ mb: 4, px: 4, py: 1.5 }}
                  >
                    Book a Call
                  </Button>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <ContactLink
                      icon={<EnvelopeSimple size={24} weight="bold" />}
                      label="Email"
                      value="victorhustad@victorcollective.com"
                      href="mailto:victorhustad@victorcollective.com"
                    />
                    <ContactLink
                      icon={<GithubLogo size={24} weight="bold" />}
                      label="GitHub"
                      value="@hustada"
                      href="https://github.com/hustada"
                    />
                    <ContactLink
                      icon={<LinkedinLogo size={24} weight="bold" />}
                      label="LinkedIn"
                      value="Viktor Ash"
                      href="https://www.linkedin.com/in/markhustad/"
                    />
                  </Box>
                </Grid>

                {/* Right side - Contact form */}
                <Grid item xs={12} md={7}>
                  <Box
                    sx={{
                      p: 4,
                      background: palette.background.elevated,
                      border: `1px solid ${palette.border.subtle}`,
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: palette.primary.main,
                        fontSize: '0.75rem',
                        letterSpacing: '0.2em',
                        display: 'block',
                        mb: 3,
                      }}
                    >
                      {'// SEND A MESSAGE'}
                    </Typography>

                    <Box
                      component="form"
                      onSubmit={handleSubmit}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                      }}
                    >
                      <TextField
                        fullWidth
                        label="Name"
                        name="from_name"
                        value={formData.from_name}
                        onChange={handleChange}
                        variant="outlined"
                        required
                      />

                      <TextField
                        fullWidth
                        label="Email"
                        name="from_email"
                        type="email"
                        value={formData.from_email}
                        onChange={handleChange}
                        variant="outlined"
                        required
                      />

                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        variant="outlined"
                        required
                      />

                      {/* Honeypot: visually hidden, off the tab order; bots fill it. */}
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        style={{ position: 'absolute', left: '-9999px', height: 0, width: 0 }}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        endIcon={isLoading ? null : <PaperPlaneTilt size={20} weight="bold" />}
                        sx={{
                          py: 1.5,
                          mt: 1,
                        }}
                      >
                        {isLoading ? 'Sending...' : 'Send Message'}
                      </Button>

                      {error && (
                        <Alert severity="error" sx={{ borderRadius: 0 }}>
                          {error}
                        </Alert>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default Contact;
