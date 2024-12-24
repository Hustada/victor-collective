import React, { ReactElement, useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useScrollTrigger,
  Slide,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import BrandSymbol from './BrandSymbol';

interface Props {
  window?: () => Window;
  children: ReactElement;
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
    { title: 'Blog', id: 'blog', path: '/blog' },
    { title: 'Newsletter', id: 'newsletter-section', path: '/#newsletter-section' },
    { title: 'Contact', id: 'contact', path: '/#contact' }
  ];

  const drawer = (
    <Box
      sx={{
        width: 250,
        height: '100%',
        backgroundColor: 'background.paper',
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
              color: 'inherit'
            }}
          >
            <ListItemText
              primary={item.title}
              sx={{
                color: 'text.primary',
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
            transition: 'background-color 0.3s ease',
            boxShadow: isScrolled ? 1 : 0,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexGrow: 0,
                textDecoration: 'none'
              }}
            >
              <BrandSymbol size={40} />
              <Typography
                variant="h6"
                component={motion.div}
                whileHover={{ scale: 1.05 }}
                sx={{
                  color: isScrolled 
                    ? theme.palette.mode === 'dark'
                      ? 'white'
                      : 'text.primary'
                    : 'white',
                  fontFamily: "'Playfair Display', serif",
                  fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.5rem' },
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                The Victor Collective
              </Typography>
            </Box>

            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{
                  color: isScrolled 
                    ? theme.palette.mode === 'dark'
                      ? 'white'
                      : 'text.primary'
                    : 'white',
                  ml: 2,
                  '&:hover': {
                    color: 'primary.main',
                  },
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
                        color: isScrolled 
                          ? theme.palette.mode === 'dark'
                            ? 'white'
                            : 'text.primary'
                          : 'white',
                        '&:hover': {
                          color: 'primary.main',
                        },
                        textDecoration: 'none'
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
      >
        {drawer}
      </Drawer>
      <Toolbar /> {/* Spacer */}
    </>
  );
};

export default Navbar;
