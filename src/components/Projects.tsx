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
import { motion } from 'framer-motion';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import { projectsConfig } from '../config/projectsConfig';
import { manualProjects } from '../config/manualProjects';
import { fetchGithubRepos, ProjectCategory } from '../services/github';
import { getRandomImage } from '../utils/imageUtils';

interface ProjectData {
  repoName: string;
  title: string;
  description: string;
  category: ProjectCategory;
  image: string;
  githubUrl: string;
  technologies: string[];
  featured: boolean;
  order?: number;
  liveUrl?: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const repos = await fetchGithubRepos('hustada');
        console.log('Fetched GitHub repos:', repos);
        
        const githubProjects = repos
          .map(repo => {
            const config = projectsConfig[repo.name];
            const manual = manualProjects[repo.name];
            
            console.log(`Processing repo ${repo.name}:`, {
              hasConfig: !!config,
              hasManual: !!manual,
              category: manual?.category || config?.category || repo.category,
              featured: manual?.featured || config?.featured || false
            });
            
            const baseProject = manual || config || {
              repoName: repo.name,
              title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              description: repo.description || '',
              featured: false,
              order: 99
            };

            const category = manual?.category || config?.category || repo.category;
            
            const project: ProjectData = {
              ...baseProject,
              category,
              githubUrl: manual?.githubUrl || repo.html_url,
              technologies: manual?.technologies || [repo.language, ...repo.topics].filter(Boolean),
              image: getRandomImage(category),
              liveUrl: manual?.liveUrl || baseProject.liveUrl || repo.homepage || undefined,
              featured: baseProject.featured ?? false
            };
            
            return project;
          });

        // Add manual-only projects
        const manualOnlyProjects = Object.entries(manualProjects)
          .filter(([name]) => !repos.find(repo => repo.name === name))
          .map(([name, project]): ProjectData => ({
            ...project,
            repoName: project.repoName || name,
            image: getRandomImage(project.category),
            featured: project.featured ?? false,
            githubUrl: project.githubUrl || `https://github.com/hustada/${project.repoName}`,
            technologies: project.technologies || []
          }));

        // Combine and sort all projects
        const allProjects = [...githubProjects, ...manualOnlyProjects]
          .filter((project): project is ProjectData => project !== null)
          // Remove duplicates based on repoName
          .reduce((unique, project) => {
            const existingProject = unique.find(p => p.repoName === project.repoName);
            if (!existingProject) {
              unique.push(project);
            }
            return unique;
          }, [] as ProjectData[])
          .sort((a, b) => {
            // Featured projects first
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            // Then by order
            return (a.order || 99) - (b.order || 99);
          })
          // Take only the first 3 projects
          .slice(0, 3);

        console.log('All projects:', allProjects);
        setProjects(allProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
        // Fallback to manual projects if GitHub API fails
        const fallbackProjects = [
          ...Object.values(projectsConfig).map(config => ({
            ...config,
            repoName: config.repoName,
            githubUrl: `https://github.com/hustada/${config.repoName}`,
            technologies: ['React', 'TypeScript'],
            image: getRandomImage(config.category),
            featured: config.featured ?? false
          })),
          ...Object.values(manualProjects).map(project => ({
            ...project,
            repoName: project.repoName,
            githubUrl: project.githubUrl || `https://github.com/hustada/${project.repoName}`,
            image: getRandomImage(project.category),
            featured: project.featured ?? false,
            technologies: project.technologies || []
          }))
        ]
          // Remove duplicates based on repoName
          .reduce((unique, project) => {
            const existingProject = unique.find(p => p.repoName === project.repoName);
            if (!existingProject) {
              unique.push(project);
            }
            return unique;
          }, [] as ProjectData[])
          .sort((a, b) => {
            // Featured projects first
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            // Then by order
            return (a.order || 99) - (b.order || 99);
          })
          // Take only the first 3 projects
          .slice(0, 3);

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
      <Box
        id="projects"
        sx={{
          backgroundColor: 'background.paper',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '2px',
            backgroundColor: 'secondary.main',
          }
        }}
      />
    </Box>
  );
};

export default Projects;
