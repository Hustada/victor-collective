import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';
import StarfieldBackground from './StarfieldBackground';

const Hero = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent', // Remove any background here
      }}
    >
      {/* Background first */}
      <StarfieldBackground />
      
      {/* Content with higher z-index */}
      <Container 
        maxWidth="md" 
        sx={{ 
          position: 'relative',
          zIndex: 10 // Ensure content is above stars
        }}
      >
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
                color: 'white', // Ensure text is visible
              }}
            >
              The Victor <Box component="span" sx={{ color: 'secondary.main' }}>Collective</Box>
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
        </motion.div>
      </Container>
    </Box>
  );
};

export default Hero;
