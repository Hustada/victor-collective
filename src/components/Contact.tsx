import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  useTheme,
  Alert,
} from '@mui/material';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';

// Rate limiting configuration
const RATE_LIMIT = {
  maxAttempts: 3,
  timeWindow: 3600000, // 1 hour in milliseconds
};

interface RateLimitData {
  attempts: number;
  timestamp: number;
}

const Contact: React.FC = () => {
  const theme = useTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitData, setRateLimitData] = useState<RateLimitData>(() => {
    const stored = localStorage.getItem('contactFormRateLimit');
    return stored ? JSON.parse(stored) : { attempts: 0, timestamp: Date.now() };
  });

  const [formData, setFormData] = useState({
    from_name: '',
    user_email: '',
    message: '',
  });

  useEffect(() => {
    localStorage.setItem('contactFormRateLimit', JSON.stringify(rateLimitData));
  }, [rateLimitData]);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    if (now - rateLimitData.timestamp > RATE_LIMIT.timeWindow) {
      // Reset if time window has passed
      setRateLimitData({ attempts: 0, timestamp: now });
      return true;
    }
    if (rateLimitData.attempts >= RATE_LIMIT.maxAttempts) {
      const remainingTime = Math.ceil((RATE_LIMIT.timeWindow - (now - rateLimitData.timestamp)) / 60000);
      setError(`Too many attempts. Please try again in ${remainingTime} minutes.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Check rate limit
    if (!checkRateLimit()) {
      return;
    }

    // Basic form validation
    if (!formData.from_name.trim() || !formData.user_email.trim() || !formData.message.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.user_email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate CSRF token
      const csrfToken = Math.random().toString(36).substring(2);
      sessionStorage.setItem('csrfToken', csrfToken);

      await emailjs.sendForm(
        process.env.REACT_APP_EMAILJS_SERVICE_ID || '',
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '',
        formRef.current!,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY || ''
      );

      // Update rate limit data
      setRateLimitData(prev => ({
        attempts: prev.attempts + 1,
        timestamp: prev.timestamp,
      }));

      setSuccess(true);
      setFormData({ from_name: '', user_email: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again later.');
      console.error('EmailJS Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Container maxWidth="md" id="contact">
      <Box sx={{ py: 8 }}>
        <Typography variant="h2" component="h2" align="center" gutterBottom>
          Contact
        </Typography>
        
        <Box component="form" ref={formRef} onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <input type="hidden" name="csrf_token" value={sessionStorage.getItem('csrfToken') || ''} />
          
          <TextField
            fullWidth
            label="Name"
            name="from_name"
            value={formData.from_name}
            onChange={handleChange}
            margin="normal"
            required
            disabled={isSubmitting}
          />
          
          <TextField
            fullWidth
            label="Email"
            name="user_email"
            type="email"
            value={formData.user_email}
            onChange={handleChange}
            margin="normal"
            required
            disabled={isSubmitting}
          />
          
          <TextField
            fullWidth
            label="Message"
            name="message"
            multiline
            rows={4}
            value={formData.message}
            onChange={handleChange}
            margin="normal"
            required
            disabled={isSubmitting}
          />

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ width: '100%', maxWidth: 400 }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </Box>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Alert severity="success" sx={{ mt: 2 }}>
                  Message sent successfully! I'll get back to you soon.
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Container>
  );
};

export default Contact;
