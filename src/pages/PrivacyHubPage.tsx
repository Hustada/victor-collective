import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from '@phosphor-icons/react';
import { alpha } from '@mui/material/styles';
import { getAllPrivacyPolicies } from '../config/privacyConfig';
import { palette } from '../theme';
import GridPattern from '../components/effects/GridPattern';

const PrivacyHubPage: React.FC = () => {
  const navigate = useNavigate();
  const policies = getAllPrivacyPolicies();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 16,
        pb: 12,
        position: 'relative',
        backgroundColor: palette.background.base,
      }}
    >
      <GridPattern opacity={0.03} fadeDirection="bottom" />

      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                color: palette.primary.main,
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                display: 'block',
                mb: 2,
              }}
            >
              {'// LEGAL'}
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                color: palette.text.primary,
                mb: 3,
              }}
            >
              Privacy Policies
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: palette.text.secondary,
                maxWidth: 600,
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.8,
              }}
            >
              We believe in transparency. Select an app below to view its privacy policy
              and learn how we handle your data.
            </Typography>
          </Box>
        </motion.div>

        {/* App Cards */}
        <Grid container spacing={3} justifyContent="center">
          {policies.map((policy, index) => (
            <Grid item xs={12} sm={6} md={4} key={policy.slug}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Box
                  onClick={() => navigate(`/privacy/${policy.slug}`)}
                  sx={{
                    p: 4,
                    cursor: 'pointer',
                    background: palette.background.elevated,
                    border: `1px solid ${palette.border.subtle}`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: palette.primary.main,
                      transform: 'translateY(-4px)',
                      '& .arrow-icon': {
                        transform: 'translateX(4px)',
                        color: palette.primary.main,
                      },
                      '& .shield-icon': {
                        color: palette.primary.main,
                      },
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 60,
                      height: 60,
                      background: `linear-gradient(135deg, transparent 50%, ${alpha(palette.primary.main, 0.1)} 50%)`,
                    },
                  }}
                >
                  <Box
                    className="shield-icon"
                    sx={{
                      mb: 3,
                      color: palette.text.secondary,
                      transition: 'color 0.2s',
                    }}
                  >
                    <ShieldCheck size={40} weight="duotone" />
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: palette.text.primary,
                      mb: 1,
                    }}
                  >
                    {policy.appName}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: palette.text.muted,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.75rem',
                      display: 'block',
                      mb: 3,
                    }}
                  >
                    Last updated: {policy.lastUpdated}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: palette.primary.main,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.75rem',
                        letterSpacing: '0.1em',
                      }}
                    >
                      VIEW POLICY
                    </Typography>
                    <ArrowRight
                      className="arrow-icon"
                      size={16}
                      color={palette.primary.main}
                      weight="bold"
                      style={{ transition: 'all 0.2s' }}
                    />
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box
            sx={{
              mt: 10,
              p: 4,
              textAlign: 'center',
              borderTop: `1px solid ${palette.border.subtle}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: palette.text.muted,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.85rem',
              }}
            >
              Questions about our privacy practices?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: palette.text.secondary,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.85rem',
                mt: 1,
              }}
            >
              Contact us at{' '}
              <Box
                component="a"
                href="mailto:victorhustad@victorcollective.com"
                sx={{
                  color: palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                victorhustad@victorcollective.com
              </Box>
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PrivacyHubPage;
