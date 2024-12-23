import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Chip,
  Stack,
  IconButton,
  CardActions
} from '@mui/material';
import { motion } from 'framer-motion';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import project1 from '../assets/brand/project1.jpg';
import project2 from '../assets/brand/project2.jpg';
import project3 from '../assets/brand/project3.jpg';

interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  category: 'Web App' | 'Mobile' | 'AI/ML';
}

const Projects = () => {
  const projects: Project[] = [
    {
      title: 'Neural Network Visualizer',
      description: 'An interactive platform for visualizing neural networks in real-time. Features dynamic node connections, weight adjustments, and learning process animations.',
      image: project1,
      technologies: ['React', 'TypeScript', 'Three.js', 'TensorFlow.js'],
      githubUrl: 'https://github.com/yourusername/neural-viz',
      liveUrl: 'https://neural-viz.demo',
      category: 'AI/ML'
    },
    {
      title: 'Quantum Computing Simulator',
      description: 'A quantum circuit simulator that allows users to build and test quantum algorithms. Includes visualization of quantum states and interactive circuit building.',
      image: project2,
      technologies: ['Python', 'Qiskit', 'React', 'WebAssembly'],
      githubUrl: 'https://github.com/yourusername/quantum-sim',
      liveUrl: 'https://quantum-sim.demo',
      category: 'Web App'
    },
    {
      title: 'AI-Powered Code Assistant',
      description: 'An intelligent code completion and refactoring tool that uses machine learning to understand context and suggest improvements.',
      image: project3,
      technologies: ['Python', 'TensorFlow', 'Natural Language Processing', 'VS Code API'],
      githubUrl: 'https://github.com/yourusername/ai-code-assistant',
      liveUrl: 'https://ai-code-assistant.demo',
      category: 'AI/ML'
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

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
            mb: 2,
            textAlign: 'center',
            color: 'text.primary',
            fontWeight: 'bold'
          }}
        >
          Featured Projects
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 6,
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          Exploring the intersection of technology and innovation
        </Typography>
        <Grid container spacing={4}>
          {projects.map((project, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                component={motion.div}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: (theme) => `0 10px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`,
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={project.image}
                  alt={project.title}
                  sx={{
                    objectFit: 'cover',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip 
                      label={project.category} 
                      size="small" 
                      color="secondary"
                      sx={{ 
                        fontWeight: 'medium',
                        backgroundColor: (theme) => 
                          project.category === 'AI/ML' ? theme.palette.success.main :
                          project.category === 'Web App' ? theme.palette.primary.main :
                          theme.palette.secondary.main
                      }}
                    />
                  </Stack>
                  <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {project.technologies.map((tech) => (
                      <Chip
                        key={tech}
                        label={tech}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)'
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  {project.githubUrl && (
                    <IconButton 
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <GitHubIcon />
                    </IconButton>
                  )}
                  {project.liveUrl && (
                    <IconButton 
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <LaunchIcon />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Projects;
