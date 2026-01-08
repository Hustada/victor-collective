import React from 'react';
import { Box } from '@mui/material';

interface GridPatternProps {
  opacity?: number;
  fadeDirection?: 'top' | 'bottom' | 'both' | 'none';
}

const GridPattern: React.FC<GridPatternProps> = ({
  opacity = 0.03,
  fadeDirection = 'bottom'
}) => {
  const getMaskImage = () => {
    switch (fadeDirection) {
      case 'top':
        return 'linear-gradient(to top, black 0%, transparent 100%)';
      case 'bottom':
        return 'linear-gradient(to bottom, black 0%, transparent 100%)';
      case 'both':
        return 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)';
      case 'none':
      default:
        return 'none';
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(211, 84, 0, ${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(211, 84, 0, ${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        maskImage: getMaskImage(),
        WebkitMaskImage: getMaskImage(),
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default GridPattern;
