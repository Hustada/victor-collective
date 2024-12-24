import React from 'react';
import { motion } from 'framer-motion';
import { Box, useTheme } from '@mui/material';

const SpaceshipAnimation: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: '60%',
          left: '-150px',
          width: '150px',
          height: '80px',
          opacity: 0.4,
        }}
        animate={{
          x: [0, window.innerWidth + 300],
          y: [0, -window.innerHeight * 0.6],
          scale: [1, 0.1],
          opacity: [0.4, 0],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg
          width="150"
          height="80"
          viewBox="0 0 150 80"
        >
          {/* Main ship body - more industrial/Alien-like */}
          <path
            d="M20 40 
               L120 40 
               L130 35 
               L140 40 
               L130 45 
               L120 40 
               L20 40 
               L10 45 
               L5 40 
               L10 35 
               L20 40"
            fill="rgba(40, 40, 45, 0.8)"
            stroke="rgba(180, 180, 190, 0.6)"
            strokeWidth="1"
            filter="url(#alienGlow)"
          />
          
          {/* Industrial details */}
          <path
            d="M30 35 L110 35 
               M30 45 L110 45 
               M40 30 L40 50 
               M60 30 L60 50
               M80 30 L80 50
               M100 30 L100 50"
            stroke="rgba(120, 120, 130, 0.6)"
            strokeWidth="0.5"
            filter="url(#alienGlow)"
          />
          
          {/* Engine glow */}
          <circle
            cx="15"
            cy="40"
            r="3"
            fill="rgba(200, 150, 50, 0.6)"
            filter="url(#engineGlow)"
          >
            <animate
              attributeName="opacity"
              values="0.4;0.8;0.4"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Secondary engine glows */}
          <circle cx="12" cy="38" r="1.5" fill="rgba(200, 150, 50, 0.4)" filter="url(#engineGlow)" />
          <circle cx="12" cy="42" r="1.5" fill="rgba(200, 150, 50, 0.4)" filter="url(#engineGlow)" />

          {/* Metallic/industrial glow effects */}
          <defs>
            <filter id="alienGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="alienBlur"/>
              <feComposite
                in="alienBlur"
                operator="over"
                in2="SourceGraphic"
              />
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="2"
                floodColor="#1a1a1f"
                floodOpacity="0.8"
              />
            </filter>
            <filter id="engineGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="engineBlur"/>
              <feComposite
                in="engineBlur"
                operator="over"
                in2="SourceGraphic"
              />
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor="#c89632"
                floodOpacity="0.6"
              />
            </filter>
          </defs>
        </svg>
      </motion.div>
    </Box>
  );
};

export default SpaceshipAnimation;
