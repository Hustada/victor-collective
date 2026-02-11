import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Link,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeSimple,
  GithubLogo,
  CheckCircle,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import { alpha } from '@mui/material/styles';
import emailjs from '@emailjs/browser';
import SectionHeader from './ui/SectionHeader';
import { palette } from '../theme';

interface ContactLinkProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}

const ContactLink: React.FC<ContactLinkProps> = ({ icon, label, value, href }) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      py: 2,
      px: 3,
      textDecoration: 'none',
      border: `1px solid ${palette.border.subtle}`,
      background: palette.background.elevated,
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: palette.primary.main,
        transform: 'translateX(8px)',
        '& .contact-icon': {
          color: palette.primary.main,
        },
      },
    }}
  >
    <Box
      className="contact-icon"
      sx={{
        color: palette.text.secondary,
        transition: 'color 0.2s',
        display: 'flex',
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: palette.text.muted,
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          display: 'block',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: palette.text.primary,
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Link>
);

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    emailjs.init('LOfBCNYKVmwoQ10nV');
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await emailjs.send('service_na22lkl', 'template_6z9asrk', formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({ from_name: '', from_email: '', message: '' });
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
                  <CheckCircle
                    size={80}
                    color={palette.primary.main}
                    weight="duotone"
                  />
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

                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary' }}
                >
                  Thanks for reaching out. I'll get back to you as soon as possible.
                </Typography>

                <Button
                  variant="outlined"
                  onClick={handleReset}
                  sx={{ mt: 2 }}
                >
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
                    subtitle="Let's build something great together"
                  />

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      mb: 4,
                      lineHeight: 1.8,
                    }}
                  >
                    Have a project in mind or want to collaborate? I'm always open
                    to discussing innovative ideas and opportunities.
                  </Typography>

                  {/* Contact links */}
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

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        endIcon={
                          isLoading ? null : (
                            <PaperPlaneTilt size={20} weight="bold" />
                          )
                        }
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
