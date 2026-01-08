import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  HouseLine,
  User,
  Cube,
  Article,
  EnvelopeSimple,
  List as ListIcon,
  X,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { palette } from '../theme';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  id: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, id, path, isActive, onClick }) => {
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

  const menuItems = [
    { title: 'Home', id: 'hero', path: '/', icon: <HouseLine size={24} weight="bold" /> },
    { title: 'About', id: 'about', path: '/#about', icon: <User size={24} weight="bold" /> },
    { title: 'Projects', id: 'projects', path: '/#projects', icon: <Cube size={24} weight="bold" /> },
    { title: 'Blog', id: 'blog', path: '/#blog', icon: <Article size={24} weight="bold" /> },
    { title: 'Contact', id: 'contact', path: '/#contact', icon: <EnvelopeSimple size={24} weight="bold" /> },
  ];

  const getActiveItem = () => {
    if (location.pathname.startsWith('/blog')) return 'blog';
    return 'hero';
  };

  const mobileDrawer = (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: palette.background.overlay,
        pt: 8,
        px: 3,
      }}
    >
      {/* Close button */}
      <IconButton
        onClick={() => setMobileOpen(false)}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: palette.text.primary,
        }}
      >
        <X size={24} weight="bold" />
      </IconButton>

      {/* Brand */}
      <Typography
        variant="h3"
        sx={{
          color: palette.text.primary,
          mb: 6,
          fontFamily: '"Space Grotesk", sans-serif',
        }}
      >
        TVC
      </Typography>

      {/* Nav items */}
      <List sx={{ p: 0 }}>
        {menuItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ListItem
              component={Link}
              to={item.path}
              onClick={() => {
                if (isHomePage) scrollTo(item.id);
                setMobileOpen(false);
              }}
              sx={{
                py: 2,
                px: 0,
                borderBottom: `1px solid ${palette.border.subtle}`,
                textDecoration: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                  '& .MuiListItemIcon-root': {
                    color: palette.primary.main,
                  },
                  '& .MuiListItemText-primary': {
                    color: palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: palette.text.secondary,
                  minWidth: 48,
                  transition: 'color 0.2s ease',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                sx={{
                  '& .MuiTypography-root': {
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    color: palette.text.primary,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    transition: 'color 0.2s ease',
                  },
                }}
              />
            </ListItem>
          </motion.div>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop: Floating Command Bar */}
      {!isMobile && (
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
                id={item.id}
                path={item.path}
                isActive={getActiveItem() === item.id}
                onClick={() => {
                  if (isHomePage) scrollTo(item.id);
                }}
              />
            ))}
          </Box>
        </motion.nav>
      )}

      {/* Mobile: Floating Menu Button */}
      {isMobile && (
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
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: '100%',
            maxWidth: 320,
            backgroundColor: palette.background.overlay,
            borderLeft: `1px solid ${palette.border.subtle}`,
          },
        }}
      >
        {mobileDrawer}
      </Drawer>
    </>
  );
};

export default Navbar;
