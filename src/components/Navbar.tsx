import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  useScrollTrigger,
  Slide,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import BrandSymbol from './BrandSymbol';

interface Props {
  window?: () => Window;
  children: React.ReactElement;
}

const HideOnScroll = ({ children, window }: Props) => {
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (elementId: string) => {
    if (isHomePage) {
      const element = document.getElementById(elementId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const menuItems = [
    { title: 'Home', id: 'hero', path: '/' },
    { title: 'About', id: 'about', path: '/#about' },
    { title: 'Projects', id: 'projects', path: '/#projects' },
    { title: 'Blog', id: 'blog', path: '/#blog' },
    { title: 'Contact', id: 'contact', path: '/#contact' }
  ];

  const drawer = (
    <Box
      sx={{
        width: 250,
        height: '100%',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        pt: 8,
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.title}
            component={Link}
            to={item.path}
            onClick={() => {
              if (isHomePage) scrollTo(item.id);
              setMobileOpen(false);
            }}
            sx={{ 
              cursor: 'pointer',
              textDecoration: 'none',
              color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'primary.main',
              },
            }}
          >
            <ListItemText
              primary={item.title}
              sx={{
                '& .MuiTypography-root': {
                  fontSize: '1.1rem',
                  fontWeight: 500,
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <HideOnScroll>
        <AppBar
          sx={{
            backgroundColor: isScrolled 
              ? theme.palette.mode === 'dark' 
                ? 'rgba(0, 0, 0, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)'
              : 'transparent',
            backdropFilter: isScrolled ? 'blur(10px)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isScrolled ? '0px 2px 4px -1px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <Toolbar>
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexGrow: 0,
                textDecoration: 'none',
              }}
            >
              <motion.div whileHover={{ scale: 1.05 }}>
                <BrandSymbol size={40} />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: !isScrolled || theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                    fontFamily: "'Playfair Display', serif",
                    fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.5rem' },
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.3s ease',
                  }}
                >
                  The Victor Collective
                </Typography>
              </motion.div>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {isMobile ? (
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{
                  color: !isScrolled || theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                  transition: 'color 0.3s ease',
                }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                {menuItems.map((item) => (
                  <motion.div
                    key={item.title}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      component={Link}
                      to={item.path}
                      onClick={() => {
                        if (isHomePage) scrollTo(item.id);
                      }}
                      sx={{
                        color: !isScrolled || theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: 'primary.main',
                        },
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {item.title}
                    </Button>
                  </motion.div>
                ))}
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
