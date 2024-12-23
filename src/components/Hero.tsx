import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #000000 30%, #D35400 90%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        component={motion.div}
        animate={{
          scale: [1, 2, 2, 1, 1],
          rotate: [0, 0, 270, 270, 0],
          opacity: [1, 0.5, 0.5, 0.5, 1],
        }}
        transition={{
          duration: 20,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.8, 1],
          repeat: Infinity,
        }}
        sx={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(211, 84, 0, 0.1)',
          filter: 'blur(40px)',
        }}
      />
      
      <Container maxWidth="md">
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Typography
            variant="h1"
            component={motion.h1}
            sx={{
              fontWeight: 700,
              fontSize: { xs: '3rem', md: '4.5rem' },
              mb: 2,
              letterSpacing: '-0.02em',
            }}
          >
            Creative
            <Box
              component="span"
              sx={{
                color: 'secondary.main',
                display: 'block',
              }}
            >
              Developer
            </Box>
          </Typography>
          
          <Typography
            variant="h4"
            component={motion.p}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            sx={{
              fontWeight: 300,
              mb: 4,
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            Crafting digital experiences with passion
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
