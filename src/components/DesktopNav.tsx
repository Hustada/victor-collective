import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { palette } from '../theme';

interface MenuItem {
  title: string;
  id: string;
  path: string;
  icon: React.ReactNode;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
    >
      <Box
        component={Link}
        to={path}
        onClick={onClick}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 1.5,
          textDecoration: 'none',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: isActive ? '100%' : 0,
            height: 2,
            background: palette.primary.main,
            transition: 'width 0.3s ease',
          },
          '&:hover::after': {
            width: '100%',
          },
        }}
      >
        <Box
          sx={{
            color: isActive ? palette.primary.main : palette.text.secondary,
            transition: 'color 0.2s ease',
            '&:hover': {
              color: palette.primary.main,
            },
          }}
        >
          {icon}
        </Box>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: palette.text.secondary,
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
};

interface DesktopNavProps {
  menuItems: MenuItem[];
  activeItem: string;
  isHomePage: boolean;
  scrollTo: (elementId: string) => void;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ menuItems, activeItem, isHomePage, scrollTo }) => (
  <motion.nav
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.5 }}
    style={{
      position: 'fixed',
      bottom: 32,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        gap: 0,
        padding: '8px 16px',
        background: alpha(palette.background.overlay, 0.9),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${palette.border.subtle}`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px ${alpha(palette.primary.main, 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: alpha(palette.primary.main, 0.3),
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px ${alpha(palette.primary.main, 0.2)}`,
        },
      }}
    >
      {menuItems.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.title}
          path={item.path}
          isActive={activeItem === item.id}
          onClick={() => {
            if (isHomePage) scrollTo(item.id);
          }}
        />
      ))}
    </Box>
  </motion.nav>
);

export default DesktopNav;
