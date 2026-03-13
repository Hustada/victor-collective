import React from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import SectionHeader from './ui/SectionHeader';
import GridPattern from './effects/GridPattern';
import SkillBar, { Skill } from './SkillBar';
import { palette } from '../theme';

const skills: Skill[] = [
  {
    name: 'AI / Machine Learning',
    level: 85,
    description: 'LangChain, OpenAI, TensorFlow, RAG Systems',
    color: palette.primary.main,
  },
  {
    name: 'React & TypeScript',
    level: 90,
    description: 'Next.js, Material-UI, Framer Motion, React Native',
    color: palette.secondary.main,
  },
  {
    name: 'Python Development',
    level: 88,
    description: 'FastAPI, Django, Data Science, Automation',
    color: palette.primary.light,
  },
  {
    name: 'Full Stack & DevOps',
    level: 82,
    description: 'Node.js, PostgreSQL, AWS, Docker',
    color: palette.secondary.light,
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
          title="About"
          subtitle="Building digital experiences with modern technologies"
        />

        <Grid container spacing={8} alignItems="center">
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
                    alt="Victor Profile"
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
                  mb: 3,
                  lineHeight: 1.8,
                }}
              >
                I'm a passionate developer focused on creating innovative digital solutions at the
                intersection of AI and modern web development. With expertise in full-stack
                development and machine learning, I transform complex ideas into elegant, functional
                experiences.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 6,
                  lineHeight: 1.8,
                }}
              >
                My approach combines technical expertise with creative problem-solving, ensuring
                that every project not only meets but exceeds expectations. I believe in writing
                clean, maintainable code that scales.
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
                  {'// TECHNICAL EXPERTISE'}
                </Typography>

                {skills.map((skill, index) => (
                  <SkillBar key={skill.name} skill={skill} index={index} />
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
