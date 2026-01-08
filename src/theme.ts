import { createTheme, alpha } from '@mui/material/styles';

// Obsidian Ember Color Palette
const palette = {
  // Backgrounds (darkest to lightest)
  background: {
    void: '#000000',
    base: '#0a0a0f',
    elevated: '#12121a',
    overlay: '#1a1a24',
  },

  // Primary accent - Burnt Orange
  primary: {
    main: '#D35400',
    light: '#E67E22',
    dark: '#A04000',
    glow: 'rgba(211, 84, 0, 0.4)',
  },

  // Secondary accent - Warm Gold
  secondary: {
    main: '#F39C12',
    light: '#F5B041',
    dark: '#D68910',
    glow: 'rgba(243, 156, 18, 0.3)',
  },

  // Text
  text: {
    primary: '#ffffff',
    secondary: '#888899',
    muted: '#555566',
  },

  // Borders
  border: {
    subtle: '#222233',
    default: '#333344',
    strong: '#444455',
    accent: '#D35400',
  },

  // Status
  success: '#00ff88',
  warning: '#ffaa00',
  error: '#ff3366',
};

// Custom shadow levels with depth
const shadows = [
  'none',
  '0 2px 4px rgba(0,0,0,0.5)',
  '0 4px 8px rgba(0,0,0,0.5)',
  '0 8px 16px rgba(0,0,0,0.5)',
  '0 12px 24px rgba(0,0,0,0.5)',
  '0 16px 32px rgba(0,0,0,0.5)',
  '0 20px 40px rgba(0,0,0,0.5)',
  '0 24px 48px rgba(0,0,0,0.5)',
  `0 16px 32px rgba(0,0,0,0.5), 0 0 60px ${palette.primary.glow}`,
  `0 20px 40px rgba(0,0,0,0.5), 0 0 80px ${palette.primary.glow}`,
  ...Array(15).fill('none'), // Fill remaining shadow slots
] as const;

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: palette.primary.main,
      light: palette.primary.light,
      dark: palette.primary.dark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: palette.secondary.main,
      light: palette.secondary.light,
      dark: palette.secondary.dark,
      contrastText: '#000000',
    },
    background: {
      default: palette.background.base,
      paper: palette.background.elevated,
    },
    text: {
      primary: palette.text.primary,
      secondary: palette.text.secondary,
    },
    divider: palette.border.subtle,
    success: {
      main: palette.success,
    },
    warning: {
      main: palette.warning,
    },
    error: {
      main: palette.error,
    },
  },

  shape: {
    borderRadius: 0, // Sharp edges globally
  },

  shadows: shadows as any,

  typography: {
    fontFamily: '"Space Grotesk", "Inter", sans-serif',

    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: 'clamp(3rem, 8vw, 5rem)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
      textTransform: 'uppercase' as const,
    },

    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
    },

    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'uppercase' as const,
    },

    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },

    h5: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '1.125rem',
      fontWeight: 600,
    },

    h6: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '1rem',
      fontWeight: 600,
    },

    body1: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '1.125rem',
      lineHeight: 1.7,
    },

    body2: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.6,
    },

    caption: {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.875rem',
      letterSpacing: '0.05em',
    },

    overline: {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.75rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },

    button: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.base,
          scrollBehavior: 'smooth',
        },
        '::selection': {
          backgroundColor: alpha(palette.primary.main, 0.3),
          color: palette.text.primary,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '12px 32px',
          fontSize: '0.875rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: `0 0 20px ${palette.primary.glow}`,
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: alpha(palette.primary.main, 0.1),
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: palette.background.elevated,
          border: `1px solid ${palette.border.subtle}`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: alpha(palette.primary.main, 0.1),
          border: `1px solid ${alpha(palette.primary.main, 0.3)}`,
          color: palette.primary.light,
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            '& fieldset': {
              borderColor: palette.border.default,
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: palette.border.strong,
            },
            '&.Mui-focused fieldset': {
              borderColor: palette.primary.main,
              boxShadow: `0 0 20px ${palette.primary.glow}`,
            },
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(palette.primary.main, 0.1),
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: 'transparent',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          backgroundColor: palette.background.overlay,
          borderLeft: `1px solid ${palette.border.subtle}`,
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: {
          color: palette.primary.light,
          textDecoration: 'none',
          transition: 'color 0.2s ease',
          '&:hover': {
            color: palette.primary.main,
          },
        },
      },
    },
  },
});

// Export palette for use in components
export { palette };
export default theme;
