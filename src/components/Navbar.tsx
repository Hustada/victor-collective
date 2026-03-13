import React, { useState } from 'react';
import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import {
  HouseLine,
  User,
  Cube,
  Article,
  EnvelopeSimple,
  List as ListIcon,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import { palette } from '../theme';

const menuItems = [
  { title: 'Home', id: 'hero', path: '/', icon: <HouseLine size={24} weight="bold" /> },
  { title: 'About', id: 'about', path: '/#about', icon: <User size={24} weight="bold" /> },
  { title: 'Projects', id: 'projects', path: '/#projects', icon: <Cube size={24} weight="bold" /> },
  { title: 'Blog', id: 'blog', path: '/#blog', icon: <Article size={24} weight="bold" /> },
  {
    title: 'Contact',
    id: 'contact',
    path: '/#contact',
    icon: <EnvelopeSimple size={24} weight="bold" />,
  },
];

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const scrollTo = (elementId: string) => {
    if (isHomePage) {
      const element = document.getElementById(elementId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const getActiveItem = () => {
    if (location.pathname.startsWith('/blog')) return 'blog';
    return 'hero';
  };

  return (
    <>
      {!isMobile && (
        <DesktopNav
          menuItems={menuItems}
          activeItem={getActiveItem()}
          isHomePage={isHomePage}
          scrollTo={scrollTo}
        />
      )}

      {isMobile && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
          >
            <IconButton
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              sx={{
                width: 56,
                height: 56,
                background: palette.background.elevated,
                border: `1px solid ${palette.border.subtle}`,
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 30px ${alpha(palette.primary.main, 0.2)}`,
                color: palette.primary.main,
                '&:hover': {
                  background: palette.background.overlay,
                  borderColor: palette.primary.main,
                },
              }}
            >
              <ListIcon size={28} weight="bold" />
            </IconButton>
          </motion.div>

          <MobileNav
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            menuItems={menuItems}
            isHomePage={isHomePage}
            scrollTo={scrollTo}
          />
        </>
      )}
    </>
  );
};

export default Navbar;
