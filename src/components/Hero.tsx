import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';

const Hero = () => {
  const { scrollY } = useScroll();
  
  // Parallax effects
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  // Background shapes for visual interest
  const shapes = [
    { size: 300, x: '10%', y: '20%', delay: 0 },
    { size: 200, x: '80%', y: '40%', delay: 0.2 },
    { size: 150, x: '60%', y: '70%', delay: 0.4 },
  ];

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
      {/* Animated background shapes */}
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 0.1,
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            delay: shape.delay,
          }}
          style={{
            position: 'absolute',
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
            borderRadius: '50%',
            background: 'rgba(211, 84, 0, 0.3)',
            filter: 'blur(40px)',
          }}
        />
      ))}

      {/* Parallax text content */}
      <Container maxWidth="md">
        <motion.div style={{ y, opacity }}>
          <Box sx={{ position: 'relative' }}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
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
                }}
              >
                The Victor <Box component="span" sx={{ color: 'secondary.main' }}>Collective</Box>
              </Typography>
            </motion.div>

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

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
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

            {/* Floating arrow indicator */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, 20, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              style={{
                position: 'absolute',
                bottom: '-100px',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center',
                  fontSize: '2rem',
                }}
              >
                ↓
              </Typography>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Hero;
