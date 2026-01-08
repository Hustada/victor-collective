import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { palette } from '../../theme';

interface DepthCardProps extends Omit<BoxProps, 'component'> {
  children: React.ReactNode;
  shadowOffset?: number;
  hoverLift?: number;
  glowOnHover?: boolean;
  onClick?: () => void;
}

const DepthCard: React.FC<DepthCardProps> = ({
  children,
  shadowOffset = 8,
  hoverLift = 8,
  glowOnHover = true,
  onClick,
  sx,
  ...props
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
      onClick={onClick}
      {...props}
    >
      {/* Shadow block */}
      <Box
        sx={{
          position: 'absolute',
          top: shadowOffset,
          left: shadowOffset,
          right: -shadowOffset,
          bottom: -shadowOffset,
          background: alpha(palette.primary.main, 0.15),
          border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
          zIndex: 0,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="depth-shadow"
      />

      {/* Main card */}
      <motion.div
        whileHover={{
          y: -hoverLift,
          transition: { type: 'spring', stiffness: 400, damping: 25 },
        }}
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
        }}
      >
        <Box
          sx={{
            height: '100%',
            background: palette.background.elevated,
            border: `1px solid ${palette.border.subtle}`,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: palette.primary.main,
              boxShadow: glowOnHover
                ? `0 20px 40px rgba(0,0,0,0.4), 0 0 40px ${palette.primary.glow}`
                : '0 20px 40px rgba(0,0,0,0.4)',
            },
          }}
        >
          {children}
        </Box>
      </motion.div>
    </Box>
  );
};

export default DepthCard;
