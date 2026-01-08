import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import { palette } from '../../theme';

interface GeometricShapesProps {
  mousePosition?: { x: number; y: number };
}

// Wireframe cube component
const WireframeCube: React.FC<{
  size: number;
  rotation: { x: number; y: number; z: number };
  position: { x: number; y: number };
  delay: number;
}> = ({ size, rotation, position, delay }) => {
  const strokeColor = palette.primary.main;
  const strokeOpacity = 0.6;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateX: rotation.x,
        rotateY: rotation.y,
        rotateZ: rotation.z,
      }}
      transition={{
        opacity: { duration: 0.8, delay },
        scale: { duration: 0.8, delay },
        rotateX: { duration: 20, repeat: Infinity, ease: 'linear' },
        rotateY: { duration: 15, repeat: Infinity, ease: 'linear' },
        rotateZ: { duration: 25, repeat: Infinity, ease: 'linear' },
      }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {/* Front face */}
        <polygon
          points="20,20 80,20 80,80 20,80"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1"
          opacity={strokeOpacity}
        />
        {/* Back face (offset) */}
        <polygon
          points="30,10 90,10 90,70 30,70"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1"
          opacity={strokeOpacity * 0.5}
        />
        {/* Connecting lines */}
        <line x1="20" y1="20" x2="30" y2="10" stroke={strokeColor} strokeWidth="1" opacity={strokeOpacity * 0.7} />
        <line x1="80" y1="20" x2="90" y2="10" stroke={strokeColor} strokeWidth="1" opacity={strokeOpacity * 0.7} />
        <line x1="80" y1="80" x2="90" y2="70" stroke={strokeColor} strokeWidth="1" opacity={strokeOpacity * 0.7} />
        <line x1="20" y1="80" x2="30" y2="70" stroke={strokeColor} strokeWidth="1" opacity={strokeOpacity * 0.7} />
      </svg>
    </motion.div>
  );
};

// Wireframe pyramid component
const WireframePyramid: React.FC<{
  size: number;
  rotation: { x: number; y: number; z: number };
  position: { x: number; y: number };
  delay: number;
}> = ({ size, rotation, position, delay }) => {
  const strokeColor = palette.secondary.main;
  const strokeOpacity = 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateX: rotation.x,
        rotateY: rotation.y,
        rotateZ: rotation.z,
      }}
      transition={{
        opacity: { duration: 0.8, delay },
        scale: { duration: 0.8, delay },
        rotateX: { duration: 25, repeat: Infinity, ease: 'linear' },
        rotateY: { duration: 20, repeat: Infinity, ease: 'linear' },
        rotateZ: { duration: 30, repeat: Infinity, ease: 'linear' },
      }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        transformStyle: 'preserve-3d',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {/* Base */}
        <polygon
          points="20,80 80,80 90,60 30,60"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1"
          opacity={strokeOpacity}
        />
        {/* Edges to apex */}
        <line x1="20" y1="80" x2="50" y2="20" stroke={strokeColor} strokeWidth="1" opacity={strokeOpacity} />
        <line x1="80" y1="80" x2="50" y2="20" stroke={strokeColor} strokeWidth="1" opacity={strokeOpacity} />
        <line x1="30" y1="60" x2="50" y2="20" stroke={strokeColor} strokeWidth="1" opacity={strokeOpacity * 0.6} />
        <line x1="90" y1="60" x2="50" y2="20" stroke={strokeColor} strokeWidth="1" opacity={strokeOpacity * 0.6} />
      </svg>
    </motion.div>
  );
};

// Floating particles
const FloatingParticle: React.FC<{
  size: number;
  position: { x: number; y: number };
  delay: number;
}> = ({ size, position, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        y: [0, -30, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        background: palette.primary.main,
        boxShadow: `0 0 ${size * 2}px ${palette.primary.glow}`,
      }}
    />
  );
};

const GeometricShapes: React.FC<GeometricShapesProps> = ({ mousePosition }) => {
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (mousePosition) {
      // Calculate parallax offset based on mouse position
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setParallaxOffset({
        x: (mousePosition.x - centerX) * 0.02,
        y: (mousePosition.y - centerY) * 0.02,
      });
    }
  }, [mousePosition]);

  const shapes = [
    { type: 'cube', size: 120, position: { x: '10%', y: '20%' }, rotation: { x: 45, y: 45, z: 0 }, delay: 0 },
    { type: 'cube', size: 80, position: { x: '70%', y: '15%' }, rotation: { x: 30, y: 60, z: 15 }, delay: 0.2 },
    { type: 'pyramid', size: 100, position: { x: '60%', y: '50%' }, rotation: { x: 20, y: 30, z: 10 }, delay: 0.4 },
    { type: 'cube', size: 60, position: { x: '25%', y: '65%' }, rotation: { x: 60, y: 30, z: 45 }, delay: 0.6 },
    { type: 'pyramid', size: 70, position: { x: '80%', y: '70%' }, rotation: { x: 15, y: 45, z: 20 }, delay: 0.8 },
  ];

  const particles = [
    { size: 4, position: { x: '15%', y: '30%' }, delay: 0 },
    { size: 3, position: { x: '45%', y: '25%' }, delay: 1 },
    { size: 5, position: { x: '75%', y: '40%' }, delay: 2 },
    { size: 3, position: { x: '30%', y: '55%' }, delay: 1.5 },
    { size: 4, position: { x: '85%', y: '60%' }, delay: 0.5 },
    { size: 3, position: { x: '55%', y: '75%' }, delay: 2.5 },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{
          x: parallaxOffset.x,
          y: parallaxOffset.y,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 100,
        }}
        style={{
          position: 'absolute',
          inset: 0,
        }}
      >
        {shapes.map((shape, index) => {
          const posX = typeof shape.position.x === 'string'
            ? shape.position.x
            : `${shape.position.x}px`;
          const posY = typeof shape.position.y === 'string'
            ? shape.position.y
            : `${shape.position.y}px`;

          if (shape.type === 'cube') {
            return (
              <WireframeCube
                key={`cube-${index}`}
                size={shape.size}
                rotation={shape.rotation}
                position={{ x: parseInt(posX), y: parseInt(posY) }}
                delay={shape.delay}
              />
            );
          } else {
            return (
              <WireframePyramid
                key={`pyramid-${index}`}
                size={shape.size}
                rotation={shape.rotation}
                position={{ x: parseInt(posX), y: parseInt(posY) }}
                delay={shape.delay}
              />
            );
          }
        })}

        {particles.map((particle, index) => (
          <FloatingParticle
            key={`particle-${index}`}
            size={particle.size}
            position={{
              x: parseInt(particle.position.x),
              y: parseInt(particle.position.y),
            }}
            delay={particle.delay}
          />
        ))}
      </motion.div>
    </Box>
  );
};

export default GeometricShapes;
