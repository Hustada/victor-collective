import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowRight, CaretDown } from '@phosphor-icons/react';
import GridPattern from './effects/GridPattern';
import GeometricShapes from './effects/GeometricShapes';
import ScrambleText from './effects/ScrambleText';
import Cursor from './effects/Cursor';
import { palette } from '../theme';

const Hero: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    projectsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <Box
      id="hero"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${palette.background.void} 0%, ${palette.background.base} 50%, ${palette.background.elevated} 100%)`,
      }}
    >
      <GridPattern opacity={0.04} fadeDirection="both" />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 30% 20%, ${palette.primary.glow} 0%, transparent 50%)`,
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
        <Grid container spacing={4} alignItems="center" sx={{ minHeight: '100vh', py: 8 }}>
          <Grid item xs={12} md={7}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants}>
                <Typography
                  variant="overline"
                  sx={{
                    color: palette.primary.main,
                    fontSize: '0.875rem',
                    letterSpacing: '0.15em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3,
                  }}
                >
                  {'// '}
                  <ScrambleText text="AI SYSTEMS ENGINEERING" delay={500} />
                  <Cursor />
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h1"
                  sx={{
                    background: `linear-gradient(135deg, ${palette.text.primary} 0%, ${palette.text.primary} 60%, ${palette.primary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 1,
                    lineHeight: 1.0,
                  }}
                >
                  THE VICTOR
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h1"
                  sx={{
                    color: palette.primary.main,
                    mb: 4,
                    lineHeight: 1.0,
                  }}
                >
                  COLLECTIVE
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="body1"
                  sx={{
                    color: palette.text.secondary,
                    maxWidth: 500,
                    mb: 6,
                    fontSize: '1.25rem',
                    lineHeight: 1.8,
                  }}
                >
                  Building production AI systems while the rest of the world is still figuring out
                  the prompt. Agent orchestration, vision pipelines, LLM infrastructure. First
                  principles. Smallest solution that earns its place.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="caption"
                  sx={{
                    color: palette.text.muted,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    mb: 6,
                    display: 'block',
                  }}
                >
                  VIKTOR ASH — BUILDING AT THE FRONTIER
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={scrollToProjects}
                    endIcon={<ArrowRight size={20} weight="bold" />}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    See Our Work
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={scrollToContact}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Book a Call
                  </Button>
                </Box>
              </motion.div>
            </motion.div>
          </Grid>

          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: { xs: 'none', md: 'block' },
              height: '60vh',
              position: 'relative',
            }}
          >
            <GeometricShapes mousePosition={mousePosition} />
          </Grid>
        </Grid>
      </Container>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ cursor: 'pointer' }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: palette.text.muted,
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
              }}
            >
              SCROLL
            </Typography>
            <CaretDown size={24} color={palette.text.muted} weight="bold" />
          </Box>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default Hero;
