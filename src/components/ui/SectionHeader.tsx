import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { palette } from '../../theme';

interface SectionHeaderProps {
  number: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  number,
  title,
  subtitle,
  align = 'left',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Box
        sx={{
          mb: 6,
          textAlign: align,
        }}
      >
        {/* Section number */}
        <Typography
          variant="overline"
          sx={{
            color: palette.primary.main,
            fontSize: '0.875rem',
            letterSpacing: '0.2em',
            display: 'block',
            mb: 1,
          }}
        >
          {`// ${number}`}
        </Typography>

        {/* Title with underline accent */}
        <Box
          sx={{
            display: 'inline-block',
            position: 'relative',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              color: 'text.primary',
              position: 'relative',
              display: 'inline-block',
              pb: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: align === 'center' ? '50%' : 0,
                transform: align === 'center' ? 'translateX(-50%)' : 'none',
                width: 60,
                height: 3,
                background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.secondary.main})`,
              },
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Optional subtitle */}
        {subtitle && (
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mt: 2,
              maxWidth: 600,
              mx: align === 'center' ? 'auto' : 0,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
};

export default SectionHeader;
