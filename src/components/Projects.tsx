import React, { useState, useEffect } from 'react';
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
  CardActions,
  CircularProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import { projectsConfig, ProjectConfig } from '../config/projectsConfig';
import { fetchGithubRepos } from '../services/github';

interface GithubData {
  githubUrl: string;
  technologies: string[];
  title: string;
  description: string;
  liveUrl?: string;
}

interface ProjectData extends ProjectConfig, GithubData {}

const Projects = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const repos = await fetchGithubRepos('hustada');
        console.log('Fetched repos:', repos);
        
        const validProjects = repos
          .map(repo => {
            const config = projectsConfig[repo.name];
            console.log('Checking repo:', repo.name, 'config:', config);
            if (!config) return null;

            const project: ProjectData = {
              ...config,
              githubUrl: repo.html_url,
              technologies: [repo.language].filter(Boolean),
              title: config.title,
              description: config.description,
              liveUrl: config.liveUrl || (repo.homepage || undefined)
            };
            return project;
          })
          .filter((project): project is ProjectData => project !== null)
          .sort((a, b) => ((a?.order || 99) - (b?.order || 99)));

        console.log('Valid projects:', validProjects);
        setProjects(validProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
        // Fallback to config-only if GitHub API fails
        const fallbackProjects = Object.values(projectsConfig)
          .map(config => ({
            ...config,
            githubUrl: `https://github.com/hustada/${config.repoName}`,
            technologies: ['React', 'TypeScript'],
            title: config.title,
            description: config.description
          }))
          .sort((a, b) => ((a.order || 99) - (b.order || 99)));

        console.log('Using fallback projects:', fallbackProjects);
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

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

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
            <Grid item xs={12} md={4} key={project.repoName}>
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
                          project.category === 'React' ? theme.palette.primary.main :
                          project.category === 'Full Stack' ? theme.palette.info.main :
                          project.category === 'Python' ? theme.palette.warning.main :
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
