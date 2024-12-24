import React from 'react';
import { IconButton, useTheme as useMuiTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          position: 'fixed',
          right: '20px',
          top: '80px', // Moved below navbar
          zIndex: 1100,
          backgroundColor: muiTheme.palette.background.paper,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          '&:hover': {
            backgroundColor: muiTheme.palette.action.hover,
            transform: 'scale(1.1)',
          },
          transition: 'transform 0.2s ease-in-out',
          '@media (max-width: 600px)': {
            top: '70px', // Adjust for mobile
            right: '10px',
          }
        }}
      >
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </motion.div>
  );
};

export default ThemeToggle;
