import React from 'react';
import { Box, Typography, Container, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import StarfieldBackground from './StarfieldBackground';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Hero = () => {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      <StarfieldBackground />
      
      <Container 
        maxWidth="md" 
        sx={{ 
          position: 'relative',
          zIndex: 10,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Box sx={{ position: 'relative' }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  mb: 4,
                  letterSpacing: '-0.02em',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontFamily: "'Playfair Display', serif",
                  textAlign: 'center',
                  position: 'relative',
                  color: 'white',
                }}
              >
                The Victor <Box component="span" sx={{ color: 'secondary.main' }}>Collective</Box>
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 300,
                  mb: 4,
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  textAlign: 'center',
                }}
              >
                Exploring the intersection of AI and modern web development
              </Typography>
            </Box>

            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                my: 4,
                position: 'relative',
              }}
            >
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ 
                  scaleX: 1, 
                  opacity: [0.4, 1, 0.4],
                  transition: {
                    opacity: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }
                }}
                style={{
                  width: '280px',
                  height: '2px',
                  background: '#D35400',
                  transformOrigin: 'center',
                }}
              />
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ 
                  scaleX: 1, 
                  opacity: [1, 0.4, 1],
                  transition: {
                    opacity: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }
                }}
                style={{
                  width: '280px',
                  height: '2px',
                  background: '#D35400',
                  transformOrigin: 'center',
                }}
              />
            </Box>
          </motion.div>
        </Box>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            marginBottom: '40px',
          }}
        >
          <IconButton 
            onClick={scrollToAbout}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <KeyboardArrowDownIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Hero;
