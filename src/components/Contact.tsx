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
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Contact: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
    
    try {
      await emailjs.send(
        "service_na22lkl",
        "template_6z9asrk",
        formData
      );

      setIsSubmitted(true);

    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      from_name: '',
      from_email: '',
      message: ''
    });
  };

  const SuccessMessage = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.2,
        ease: [0, 0.71, 0.2, 1.01]
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.5,
          type: "spring",
          stiffness: 200
        }}
      >
        <CheckCircleOutlineIcon 
          sx={{ 
            fontSize: '5rem', 
            color: 'secondary.main',
            mb: 3
          }} 
        />
      </motion.div>
      
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700,
          mb: 2,
          color: 'text.primary'
        }}
      >
        Message Sent Successfully!
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'text.secondary',
          mb: 4
        }}
      >
        Thank you for reaching out! I'll get back to you as soon as possible.
      </Typography>
      
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleReset}
        sx={{
          mt: 2,
          px: 4,
          py: 1.5,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        Send Another Message
      </Button>
    </motion.div>
  );

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
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <SuccessMessage />
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ 
                  duration: 0.8,
                  ease: "easeInOut"
                }}
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

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;
