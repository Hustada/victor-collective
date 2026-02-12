import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import { GithubLogo } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { palette } from '../theme';

const Footer: React.FC = () => {
  const socialLinks = [
    {
      icon: <GithubLogo size={20} weight="bold" />,
      url: 'https://github.com/hustada',
      label: 'GitHub',
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        backgroundColor: palette.background.void,
        borderTop: `1px solid ${palette.border.subtle}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={4}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                color: palette.text.primary,
                mb: 1,
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              THE VICTOR COLLECTIVE
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: palette.text.muted,
                textAlign: { xs: 'center', md: 'left' },
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Building digital experiences with modern tech
            </Typography>
          </Grid>

          {/* Social Links */}
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              {socialLinks.map((social, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconButton
                    component={Link}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      color: palette.text.secondary,
                      border: `1px solid ${palette.border.subtle}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: palette.primary.main,
                        borderColor: palette.primary.main,
                        backgroundColor: alpha(palette.primary.main, 0.1),
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                </motion.div>
              ))}
            </Box>
          </Grid>

          {/* Copyright */}
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Typography
              variant="caption"
              sx={{
                color: palette.text.muted,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
                display: 'block',
              }}
            >
              &copy; {new Date().getFullYear()} MARK HUSTAD | THE VICTOR COLLECTIVE
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: palette.text.muted,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
              }}
            >
              ALL RIGHTS RESERVED
            </Typography>
          </Grid>
        </Grid>

        {/* Bottom accent line */}
        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: `1px solid ${palette.border.subtle}`,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: palette.text.muted,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
            }}
          >
            DESIGNED & BUILT WITH{' '}
            <Box
              component="span"
              sx={{ color: palette.primary.main }}
            >
              REACT
            </Box>{' '}
            +{' '}
            <Box
              component="span"
              sx={{ color: palette.secondary.main }}
            >
              TYPESCRIPT
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
