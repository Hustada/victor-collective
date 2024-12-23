import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar
} from '@mui/material';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

const Contact: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: ''
  });

  const [status, setStatus] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    emailjs.init("LOfBCNYKVmwoQ10nV");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await emailjs.send(
        "service_na22lkl",
        "template_6z9asrk",
        formData
      );

      setStatus({
        open: true,
        message: 'Message sent successfully!',
        severity: 'success'
      });

      // Clear form
      setFormData({
        from_name: '',
        from_email: '',
        message: ''
      });

    } catch (error) {
      console.error('Error sending email:', error);
      setStatus({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setStatus(prev => ({ ...prev, open: false }));
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: 10, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: 'background.paper'
      }}
    >
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ 
              opacity: 1, 
              x: 0,
              transition: { 
                duration: 0.8,
                ease: "easeInOut"
              }
            }}
            viewport={{ once: true }}
          >
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                mb: 3 
              }}
            >
              Get in Touch
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph 
              sx={{ 
                color: 'text.secondary', 
                lineHeight: 1.6,
                mb: 4 
              }}
            >
              Have a project in mind or want to collaborate? 
              I'm always open to discussing innovative ideas and opportunities.
              Drop me a message, and I'll get back to you soon.
            </Typography>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ 
              opacity: 1, 
              x: 0,
              transition: { 
                duration: 0.8,
                ease: "easeInOut"
              }
            }}
            viewport={{ once: true }}
          >
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 3 
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
                rows={4}
                value={formData.message}
                onChange={handleChange}
                variant="outlined"
                required
              />
              
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                Send Message
              </Button>
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      <Snackbar 
        open={status.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={status.severity}
          sx={{ width: '100%' }}
        >
          {status.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Contact;
