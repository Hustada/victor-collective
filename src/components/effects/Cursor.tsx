import React from 'react';
import { Box } from '@mui/material';
import { palette } from '../../theme';

const Cursor: React.FC = () => (
  <Box
    component="span"
    sx={{
      color: palette.primary.main,
      animation: 'blink 1s step-end infinite',
      '@keyframes blink': {
        '0%, 50%': { opacity: 1 },
        '51%, 100%': { opacity: 0 },
      },
    }}
  >
    _
  </Box>
);

export default Cursor;
