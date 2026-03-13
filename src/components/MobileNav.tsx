import React from 'react';
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { X } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { palette } from '../theme';

interface MenuItem {
  title: string;
  id: string;
  path: string;
  icon: React.ReactNode;
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  isHomePage: boolean;
  scrollTo: (elementId: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({
  open,
  onClose,
  menuItems,
  isHomePage,
  scrollTo,
}) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    ModalProps={{ keepMounted: true }}
    sx={{
      '& .MuiDrawer-paper': {
        width: '100%',
        maxWidth: 320,
        backgroundColor: palette.background.overlay,
        borderLeft: `1px solid ${palette.border.subtle}`,
      },
    }}
  >
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: palette.background.overlay,
        pt: 8,
        px: 3,
      }}
    >
      <IconButton
        onClick={onClose}
        aria-label="Close menu"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: palette.text.primary,
        }}
      >
        <X size={24} weight="bold" />
      </IconButton>

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
                onClose();
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
  </Drawer>
);

export default MobileNav;
