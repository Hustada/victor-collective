import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const StarfieldBackground = () => {
  const generateStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `star-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (3 - 1) + 1,
      delay: Math.random() * 3,
      duration: Math.random() * (4 - 2) + 2,
    }));
  };

  const stars = generateStars(100);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, #000000 30%, #D35400 90%)',
        overflow: 'hidden',
      }}
    >
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0.1 }}
          animate={{
            opacity: [0.1, 0.8, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            boxShadow: '0 0 4px #ffffff',
          }}
        />
      ))}
      
      {/* Gradient overlay to fade out stars */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(211, 84, 0, 0.95) 90%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

export default StarfieldBackground;
