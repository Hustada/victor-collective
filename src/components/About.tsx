import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <Box 
      id="about"
      component={motion.section}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      sx={{ 
        py: 8,
        backgroundColor: 'background.paper'
      }}
    >
      <Container maxWidth="md">
        <Typography 
          variant="h2" 
          component={motion.h2}
          sx={{ 
            mb: 6,
            textAlign: 'center',
            color: 'text.primary'
          }}
        >
          About Me
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              I'm a creative developer passionate about building beautiful and functional web experiences. 
              With a focus on modern technologies and clean design, I create solutions that make an impact.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              My expertise includes React, TypeScript, and modern web frameworks. 
              I believe in writing clean, maintainable code and creating intuitive user experiences.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
