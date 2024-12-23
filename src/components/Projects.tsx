import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { motion } from 'framer-motion';

const Projects = () => {
  const projects = [
    {
      title: 'Project One',
      description: 'A modern web application built with React and TypeScript',
      image: 'https://source.unsplash.com/random/400x300?tech'
    },
    {
      title: 'Project Two',
      description: 'An innovative mobile-first design implementation',
      image: 'https://source.unsplash.com/random/400x300?coding'
    },
    {
      title: 'Project Three',
      description: 'A responsive dashboard with real-time updates',
      image: 'https://source.unsplash.com/random/400x300?website'
    }
  ];

  return (
    <Box
      id="projects"
      component={motion.section}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      sx={{
        py: 8,
        backgroundColor: 'background.default'
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            mb: 6,
            textAlign: 'center',
            color: 'text.primary'
          }}
        >
          Projects
        </Typography>
        <Grid container spacing={4}>
          {projects.map((project, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                component={motion.div}
                whileHover={{ y: -10 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={project.image}
                  alt={project.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h3">
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Projects;
