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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: 'smooth' });
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const menuItems = ['about', 'projects', 'contact'];

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
            key={item}
            component={motion.div}
            whileHover={{ x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollTo(item)}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemText
              primary={item.charAt(0).toUpperCase() + item.slice(1)}
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
            backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
            transition: 'background-color 0.3s ease',
            boxShadow: isScrolled ? 1 : 0,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexGrow: 0, // Prevent box from growing
              }}
            >
              <BrandSymbol size={40} /> {/* Slightly smaller on mobile */}
              <Typography
                variant="h6"
                component={motion.div}
                whileHover={{ scale: 1.05 }}
                sx={{
                  color: isScrolled ? 'text.primary' : 'white',
                  fontFamily: "'Playfair Display', serif",
                  fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.5rem' },
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap', // Prevent text wrapping
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
                  color: isScrolled ? 'text.primary' : 'white',
                  ml: 2, // Add margin to separate from title
                  '&:hover': {
                    color: 'secondary.main',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                {menuItems.map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="text"
                      color="secondary"
                      onClick={() => scrollTo(item)}
                      sx={{
                        color: isScrolled ? 'text.primary' : 'white',
                        '&:hover': {
                          color: 'secondary.main',
                        },
                      }}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Button>
                  </motion.div>
                ))}
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <AnimatePresence>
        {mobileOpen && (
          <Drawer
            variant="temporary"
            anchor="right"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{
              keepMounted: true, // Better mobile performance
            }}
            PaperProps={{
              sx: {
                backgroundColor: 'background.paper',
                borderLeft: '2px solid',
                borderColor: 'secondary.main',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
