import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  useTheme,
  Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

const Newsletter: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    emailjs.init('LOfBCNYKVmwoQ10nV');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage('Please enter your email address');
      setStatus('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      await emailjs.send(
        'service_na22lkl',
        'template_geuplen',
        {
          subscriber_email: email,
        },
        'LOfBCNYKVmwoQ10nV'
      );

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setErrorMessage('Failed to subscribe. Please try again later.');
      setStatus('error');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.02)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 2,
              }}
            >
              Stay Updated
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: '600px',
                mx: 'auto',
                mb: 4,
              }}
            >
              Subscribe to my newsletter for the latest insights on web development,
              tech trends, and coding tips.
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.background.paper,
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={status === 'loading' || status === 'success'}
              sx={{
                px: 4,
                py: { xs: 1.5, sm: 2 },
                minWidth: { xs: '100%', sm: '150px' },
                fontWeight: 600,
              }}
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </Box>

          <AnimatePresence mode="wait">
            {(status === 'success' || status === 'error') && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  severity={status === 'success' ? 'success' : 'error'}
                  sx={{ mt: 2, maxWidth: '600px', mx: 'auto' }}
                >
                  {status === 'success'
                    ? 'Thank you for subscribing! Check your email for confirmation.'
                    : errorMessage}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Background Decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}22)`,
            zIndex: 0,
          }}
        />
      </Paper>
    </Container>
  );
};

export default Newsletter;
