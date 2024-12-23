import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';

const About = () => {
  const { scrollYProgress } = useScroll();
  
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  // Skill items with icons
  const skills = [
    { name: 'AI/ML', level: 90, icon: '🤖' },
    { name: 'React/TypeScript', level: 85, icon: '⚛️' },
    { name: 'Python/TensorFlow', level: 80, icon: '🐍' },
    { name: 'Full Stack Dev', level: 85, icon: '🚀' },
  ];

  return (
    <Box 
      id="about"
      component={motion.section}
      style={{ scale, opacity }}
      sx={{ 
        py: 12,
        backgroundColor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          background: `
            linear-gradient(45deg, #D35400 25%, transparent 25%) -50px 0,
            linear-gradient(-45deg, #D35400 25%, transparent 25%) -50px 0,
            linear-gradient(45deg, transparent 75%, #D35400 75%) -50px 0,
            linear-gradient(-45deg, transparent 75%, #D35400 75%) -50px 0
          `,
          backgroundSize: '100px 100px',
        }}
      />

      <Container maxWidth="md">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography 
            variant="h2" 
            align="center"
            sx={{ 
              mb: 6,
              color: 'text.primary',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '4px',
                backgroundColor: 'secondary.main',
              }
            }}
          >
            About Me
          </Typography>
        </motion.div>

        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                I'm a developer focused on the convergence of artificial intelligence and web development. 
                My portfolio showcases AI-driven projects that push the boundaries of what's possible on the web, 
                from natural language processing to computer vision applications.
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                With expertise in both modern web frameworks and machine learning technologies, 
                I create innovative solutions that bridge the gap between cutting-edge AI and 
                practical web applications. My work demonstrates how AI can enhance user experiences 
                and solve real-world problems.
              </Typography>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mt: { xs: 4, md: 0 } }}>
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ mr: 1 }}>
                        {skill.icon}
                      </Typography>
                      <Typography variant="h6">
                        {skill.name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: '4px',
                        backgroundColor: 'background.paper',
                        borderRadius: 1,
                        position: 'relative',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        style={{
                          height: '100%',
                          backgroundColor: '#D35400',
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
