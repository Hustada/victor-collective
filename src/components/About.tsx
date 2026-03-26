import React from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { Brain, Eye, CurrencyCircleDollar, CloudArrowUp, Code } from '@phosphor-icons/react';
import SectionHeader from './ui/SectionHeader';
import GridPattern from './effects/GridPattern';
import { palette } from '../theme';

const capabilities = [
  {
    icon: <Brain size={28} weight="duotone" />,
    title: 'AI Agent Architecture & Orchestration',
    description:
      'Multi-agent systems with sub-agent coordination, semantic memory, and scheduled autonomy.',
  },
  {
    icon: <Eye size={28} weight="duotone" />,
    title: 'Computer Vision & Photo Intelligence',
    description:
      'Multi-stage vision pipelines combining GPT-4V, Cloud Vision, and Claude for domain-specific analysis.',
  },
  {
    icon: <CurrencyCircleDollar size={28} weight="duotone" />,
    title: 'LLM Integration & Cost Optimization',
    description:
      'Smart model routing across providers, budget management, and complexity-based task classification.',
  },
  {
    icon: <CloudArrowUp size={28} weight="duotone" />,
    title: 'Production Deployment',
    description: 'Docker, AWS, CI/CD — systems that run 24/7 without babysitting.',
  },
  {
    icon: <Code size={28} weight="duotone" />,
    title: 'Full-Stack Applications',
    description: 'React, TypeScript, Python, FastAPI, PostgreSQL — whatever the problem demands.',
  },
];

const About: React.FC = () => {
  return (
    <Box
      id="about"
      sx={{
        backgroundColor: palette.background.base,
        position: 'relative',
        py: 16,
        overflow: 'hidden',
      }}
    >
      <GridPattern opacity={0.02} fadeDirection="top" />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <SectionHeader
          number="01"
          title="Capabilities"
          subtitle="What we build and how we think about it"
        />

        <Grid container spacing={8} alignItems="flex-start">
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  maxWidth: 400,
                  mx: 'auto',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    right: -12,
                    bottom: -12,
                    border: `2px solid ${palette.primary.main}`,
                    clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)',
                    zIndex: 0,
                  }}
                />

                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)',
                    zIndex: 1,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <img
                    src={process.env.PUBLIC_URL + '/assets/brand/victorcol1.jpg'}
                    alt="Viktor Ash — Founder, The Victor Collective"
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      filter: 'grayscale(20%)',
                    }}
                  />

                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(180deg, transparent 60%, ${alpha(palette.primary.main, 0.3)} 100%)`,
                    }}
                  />
                </Box>
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 5,
                  lineHeight: 1.8,
                }}
              >
                Production is the only proof that matters. Everything else is a pitch deck.
              </Typography>

              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: palette.primary.main,
                    fontSize: '0.75rem',
                    letterSpacing: '0.2em',
                    display: 'block',
                    mb: 3,
                  }}
                >
                  {'// WHAT WE DO'}
                </Typography>

                {capabilities.map((cap, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2.5,
                      mb: 3,
                      '&:last-child': { mb: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        color: palette.primary.main,
                        mt: 0.25,
                        flexShrink: 0,
                      }}
                    >
                      {cap.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: palette.text.primary,
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {cap.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: palette.text.secondary,
                          lineHeight: 1.6,
                        }}
                      >
                        {cap.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
