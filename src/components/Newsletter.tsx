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
  CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

const Newsletter: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [panelDirection, setPanelDirection] = useState<'down' | 'up'>('down');

  useEffect(() => {
    emailjs.init('LOfBCNYKVmwoQ10nV');
  }, []);

  useEffect(() => {
    if (status === 'success') {
      console.log('Setting panels to close down');
      setPanelDirection('down');
      setIsClosing(true);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    console.log('Starting form submission');
    setStatus('loading');
    setErrorMessage('');
    setIsClosing(false);
    setPanelDirection('down');

    try {
      await emailjs.send(
        'service_na22lkl',
        'template_geuplen',
        {
          subscriber_email: email,
        },
        'LOfBCNYKVmwoQ10nV'
      );

      console.log('Email sent successfully');
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Email send failed:', error);
      setStatus('error');
      setErrorMessage('Failed to subscribe. Please try again.');
    }
  };

  const resetForm = async () => {
    console.log('Starting form reset');
    setPanelDirection('up');
    setIsClosing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Finishing form reset');
    setStatus('idle');
    setIsClosing(false);
    setEmail('');
    setErrorMessage('');
  };

  const SuccessMessage = () => {
    const theme = useTheme();

    // Animation variants for the hexagon grid
    const gridVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05
        }
      }
    };

    // Animation for each hexagon
    const hexagonVariants = {
      hidden: { scale: 0, opacity: 0 },
      visible: {
        scale: 1,
        opacity: [0, 1, 0],
        transition: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }
    };

    // Data stream animation
    const streamVariants = {
      hidden: { pathLength: 0, opacity: 0 },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity
        }
      }
    };

    // Binary numbers animation
    const binaryVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i: number) => ({
        opacity: [0, 1, 0],
        y: 0,
        transition: {
          delay: i * 0.1,
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
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
          padding: '20px',
          position: 'relative',
          minHeight: '400px'
        }}
      >
        {/* Main SVG Animation */}
        <motion.svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          style={{ marginBottom: '2rem' }}
        >
          {/* Central Upload Icon */}
          <motion.circle
            cx="150"
            cy="150"
            r="50"
            fill="none"
            stroke={theme.palette.secondary.main}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Data Streams */}
          {[...Array(8)].map((_, index) => {
            const angle = (index * Math.PI * 2) / 8;
            const startX = 150 + Math.cos(angle) * 60;
            const startY = 150 + Math.sin(angle) * 60;
            const endX = 150 + Math.cos(angle) * 120;
            const endY = 150 + Math.sin(angle) * 120;

            return (
              <motion.line
                key={`stream-${index}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={theme.palette.primary.main}
                strokeWidth="2"
                variants={streamVariants}
                initial="hidden"
                animate="visible"
                style={{ opacity: 0.6 }}
              />
            );
          })}

          {/* Binary Numbers */}
          {[...Array(12)].map((_, index) => {
            const angle = (index * Math.PI * 2) / 12;
            const radius = 140;
            const x = 150 + Math.cos(angle) * radius;
            const y = 150 + Math.sin(angle) * radius;

            return (
              <motion.text
                key={`binary-${index}`}
                x={x}
                y={y}
                fill={theme.palette.text.secondary}
                fontSize="12"
                textAnchor="middle"
                variants={binaryVariants}
                custom={index}
                initial="hidden"
                animate="visible"
              >
                {Math.random() > 0.5 ? "1" : "0"}
              </motion.text>
            );
          })}

          {/* Hexagon Grid */}
          <motion.g
            variants={gridVariants}
            initial="hidden"
            animate="visible"
          >
            {[...Array(6)].map((_, index) => {
              const angle = (index * Math.PI * 2) / 6;
              const x = 150 + Math.cos(angle) * 90;
              const y = 150 + Math.sin(angle) * 90;

              return (
                <motion.path
                  key={`hexagon-${index}`}
                  d={`M ${x} ${y} l 10 0 l 5 8.66 l -5 8.66 l -10 0 l -5 -8.66 z`}
                  fill="none"
                  stroke={theme.palette.secondary.main}
                  strokeWidth="1"
                  variants={hexagonVariants}
                />
              );
            })}
          </motion.g>
        </motion.svg>

        {/* Success Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Data Upload Complete
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.text.secondary,
              mb: 4
            }}
          >
            Your subscription has been processed. Stand by for future transmissions.
          </Typography>

          <Button
            variant="outlined"
            color="secondary"
            onClick={resetForm}
            sx={{
              mt: 2,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 0 20px ${theme.palette.secondary.main}40`
              }
            }}
          >
            Initialize New Subscription
          </Button>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <Box
      component="section"
      sx={{
        py: 8,
        backgroundColor: 'background.default',
        borderBottom: `1px solid ${theme.palette.divider}`,
        mb: 8
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            background: 'transparent',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <AnimatePresence mode="wait">
            {status !== 'success' && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box textAlign="center" mb={4}>
                  <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Stay Updated
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Subscribe to receive the latest updates and insights
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {status !== 'success' ? (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ 
                  opacity: 0,
                  transition: {
                    duration: 1,
                    delay: 0.8
                  }
                }}
              >
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    maxWidth: '600px',
                    mx: 'auto',
                    position: 'relative',
                    minHeight: '56px',
                  }}
                >
                  {/* Mechanical Panel Pieces */}
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isClosing ? 1 : 0,
                      zIndex: isClosing ? 10 : -1,
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '4px',
                      perspective: '1000px',
                      pointerEvents: 'none',
                    }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: panelDirection === 'down' ? '-150%' : '150%' }}
                        animate={isClosing ? {
                          y: panelDirection === 'down' ? ['0%', '150%'] : ['-150%', '0%'],
                          rotateX: panelDirection === 'down' ? [0, 60] : [-60, 0],
                          transition: {
                            duration: 0.8,
                            delay: i * 0.2,
                            ease: [0.4, 0, 0.2, 1]
                          }
                        } : {
                          y: '0%',
                          rotateX: 0
                        }}
                        style={{
                          width: '33%',
                          height: '100%',
                          background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.primary.dark})`,
                          borderRadius: '4px',
                          border: `2px solid ${theme.palette.primary.main}`,
                          position: 'relative',
                          transformOrigin: panelDirection === 'down' ? 'top' : 'bottom',
                        }}
                      >
                        {/* Gear decoration */}
                        <motion.svg
                          viewBox="0 0 50 50"
                          style={{
                            width: '30px',
                            height: '30px',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                          animate={isClosing ? {
                            rotate: [0, panelDirection === 'down' ? 360 : -360],
                            scale: [1, 0.8],
                            transition: {
                              duration: 0.8,
                              delay: i * 0.2,
                              ease: "linear"
                            }
                          } : {}}
                        >
                          <path
                            d="M25 10L28 3L22 3L25 10ZM40 25L47 28L47 22L40 25ZM25 40L22 47L28 47L25 40ZM10 25L3 22L3 28L10 25ZM25 15C19.5 15 15 19.5 15 25C15 30.5 19.5 35 25 35C30.5 35 35 30.5 35 25C35 19.5 30.5 15 25 15Z"
                            fill={theme.palette.secondary.main}
                            style={{
                              filter: `drop-shadow(0 0 2px ${theme.palette.secondary.main})`
                            }}
                          />
                        </motion.svg>
                      </motion.div>
                    ))}
                  </motion.div>

                  <TextField
                    fullWidth
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isClosing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                      },
                      position: 'relative',
                      zIndex: isClosing ? 1 : 2
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={status === 'loading' || isClosing}
                    sx={{
                      px: 4,
                      py: { xs: 1.5, sm: 'auto' },
                      minWidth: { xs: '100%', sm: 'auto' },
                      position: 'relative',
                      overflow: 'hidden',
                      zIndex: isClosing ? 1 : 2,
                      height: { xs: '48px', sm: '56px' },
                      alignSelf: { sm: 'stretch' }
                    }}
                  >
                    {status === 'loading' ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </Box>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: {
                    delay: 0.8, // Start after panels close
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1]
                  }
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SuccessMessage />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  severity="error"
                  sx={{ mt: 2, maxWidth: '600px', mx: 'auto' }}
                >
                  {errorMessage}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </Container>
    </Box>
  );
};

export default Newsletter;
