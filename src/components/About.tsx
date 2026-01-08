import React from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import SectionHeader from './ui/SectionHeader';
import GridPattern from './effects/GridPattern';
import { palette } from '../theme';

interface Skill {
  name: string;
  level: number;
  description: string;
  color: string;
}

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

const SkillBar: React.FC<{ skill: Skill; index: number }> = ({ skill, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
  >
    <Box sx={{ mb: 4 }}>
      {/* Skill header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          mb: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '0.05em',
          }}
        >
          {skill.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: skill.color,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.875rem',
          }}
        >
          {skill.level}%
        </Typography>
      </Box>

      {/* Skill description */}
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          mb: 2,
          fontSize: '0.875rem',
        }}
      >
        {skill.description}
      </Typography>

      {/* Progress bar */}
      <Box
        sx={{
          height: 4,
          background: palette.border.subtle,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${skill.color}, ${alpha(skill.color, 0.6)})`,
            boxShadow: `0 0 20px ${alpha(skill.color, 0.5)}`,
          }}
        />
      </Box>
    </Box>
  </motion.div>
);

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
      {/* Background pattern */}
      <GridPattern opacity={0.02} fadeDirection="top" />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <SectionHeader
          number="01"
          title="About"
          subtitle="Building digital experiences with modern technologies"
        />

        <Grid container spacing={8} alignItems="center">
          {/* Profile Image with clip-path */}
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
                {/* Offset shadow block */}
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

                {/* Image container with diagonal cut */}
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
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      filter: 'grayscale(20%)',
                    }}
                  />

                  {/* Gradient overlay */}
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

          {/* Bio and Skills */}
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
                I'm a passionate developer focused on creating innovative digital solutions
                at the intersection of AI and modern web development. With expertise in
                full-stack development and machine learning, I transform complex ideas
                into elegant, functional experiences.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 6,
                  lineHeight: 1.8,
                }}
              >
                My approach combines technical expertise with creative problem-solving,
                ensuring that every project not only meets but exceeds expectations.
                I believe in writing clean, maintainable code that scales.
              </Typography>

              {/* Skills */}
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
