import React, { useState } from 'react';
import { Box, BoxProps, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface BrandSymbolProps extends BoxProps {
  size?: number;
  animated?: boolean;
  imageSrc?: string;
}

const BrandSymbol: React.FC<BrandSymbolProps> = ({ 
  size = 100, 
  animated = true, 
  sx, 
  imageSrc = '/assets/brand/victorcol4.jpg',
  ...props 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Box
      {...props}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: imageLoaded ? 'transparent' : 'rgba(211, 84, 0, 0.1)', // Soft burnt orange background
        border: '2px solid rgba(211, 84, 0, 0.2)', // Subtle border
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', // Subtle shadow
        ...sx,
      }}
    >
      {!imageLoaded && (
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'secondary.main', 
            fontWeight: 'bold',
            opacity: 0.5 
          }}
        >
          VC
        </Typography>
      )}

      <motion.img
        src={imageSrc}
        alt="Victor Collective Brand Symbol"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: imageLoaded ? 1 : 0,
        }}
        onLoad={() => setImageLoaded(true)}
        initial={animated ? { scale: 0.8, opacity: 0 } : {}}
        animate={animated && imageLoaded ? { 
          scale: [0.8, 1.05, 1],
          opacity: [0, 1, 1],
        } : {}}
        transition={animated ? {
          duration: 1,
          ease: "easeInOut",
        } : {}}
      />
      
      {/* Optional hover/interaction effect */}
      {animated && imageLoaded && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'rgba(211, 84, 0, 0.2)', // Burnt orange overlay
            opacity: 0,
          }}
          whileHover={{
            opacity: 1,
            transition: { duration: 0.3 }
          }}
        />
      )}
    </Box>
  );
};

export default BrandSymbol;
