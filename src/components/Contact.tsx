import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid,
  useTheme,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

const Contact: React.FC = () => {
  const theme = useTheme();

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

  const SuccessMessage = () => {
    const circleVariants = {
      hidden: { scale: 0, opacity: 0 },
      visible: { 
        scale: 1, 
        opacity: 1,
        transition: { duration: 0.5 }
      }
    };

    const lineVariants = {
      hidden: { pathLength: 0, opacity: 0 },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: { 
          duration: 1.5,
          ease: "easeInOut"
        }
      }
    };

    const pulseVariants = {
      pulse: {
        scale: [1, 1.1, 1],
        opacity: [0.5, 1, 0.5],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    };

    const dataPointVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.2,
          duration: 0.5
        }
      })
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <Box
          sx={{
            width: { xs: '100%', sm: '400px' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4
          }}
        >
          <motion.svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            style={{ marginBottom: '2rem' }}
          >
            {/* Background Circles */}
            <motion.svg
              viewBox="0 0 200 200"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%'
              }}
            >
              {[...Array(3)].map((_, index) => (
                <motion.circle
                  key={index}
                  cx="100"
                  cy="100"
                  r={60 - index * 15}
                  fill="none"
                  stroke={theme.palette.secondary.main}
                  strokeWidth="1"
                  initial="hidden"
                  animate="pulse"
                  variants={pulseVariants}
                  style={{ opacity: 0.2 - index * 0.05 }}
                />
              ))}
            </motion.svg>

            {/* Main SVG Animation */}
            <motion.svg
              viewBox="0 0 200 200"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%'
              }}
            >
              {/* Central Circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="40"
                fill="none"
                stroke={theme.palette.secondary.main}
                strokeWidth="2"
                initial="hidden"
                animate="visible"
                variants={circleVariants}
              />

              {/* Radiating Lines */}
              {[...Array(8)].map((_, index) => {
                const angle = (index * Math.PI * 2) / 8;
                const x1 = 100 + Math.cos(angle) * 45;
                const y1 = 100 + Math.sin(angle) * 45;
                const x2 = 100 + Math.cos(angle) * 80;
                const y2 = 100 + Math.sin(angle) * 80;

                return (
                  <motion.line
                    key={index}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={theme.palette.secondary.main}
                    strokeWidth="2"
                    initial="hidden"
                    animate="visible"
                    variants={lineVariants}
                  />
                );
              })}

              {/* Data Points */}
              {[...Array(12)].map((_, index) => {
                const angle = (index * Math.PI * 2) / 12;
                const radius = 90;
                const x = 100 + Math.cos(angle) * radius;
                const y = 100 + Math.sin(angle) * radius;

                return (
                  <motion.circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill={theme.palette.secondary.main}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    variants={dataPointVariants}
                  />
                );
              })}
            </motion.svg>
          </motion.svg>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                color: 'text.primary',
                textAlign: 'center'
              }}
            >
              Transmission Complete
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                mb: 4,
                textAlign: 'center'
              }}
            >
              Message successfully received. Standby for response.
            </Typography>
            
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReset}
              fullWidth
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                maxWidth: { xs: '100%', sm: '300px' },
                mx: 'auto',
                display: 'block',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              Initialize New Message
            </Button>
          </motion.div>
        </Box>
      </motion.div>
    );
  };

  return (
    <Box
      id="contact"
      component="section"
      sx={{
        py: 8,
        backgroundColor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container maxWidth="lg">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container justifyContent="center">
                <Grid item xs={12} md={8}>
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <SuccessMessage />
                  </motion.div>
                </Grid>
              </Grid>
            </motion.div>
          ) : (
            <motion.div
              key="form-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <motion.div
                    key="contact-text"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
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
                    key="form"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
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
