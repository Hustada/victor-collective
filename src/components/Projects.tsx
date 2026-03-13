import React from 'react';
import { Box, Container, Grid, Button, Alert } from '@mui/material';
import SectionHeader from './ui/SectionHeader';
import ProjectCard from './ProjectCard';
import ProjectSkeleton from './ProjectSkeleton';
import { useProjects } from '../hooks/useProjects';
import { palette } from '../theme';

const Projects: React.FC = () => {
  const { projects, loading, error, retry } = useProjects();

  return (
    <Box
      id="projects"
      sx={{
        py: 16,
        backgroundColor: palette.background.elevated,
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        <SectionHeader
          number="02"
          title="Projects"
          subtitle="Featured work showcasing modern web development and AI integration"
          align="center"
        />

        {error && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={retry}>
                Retry
              </Button>
            }
            sx={{ mb: 4, borderRadius: 0 }}
          >
            {error} Showing cached projects instead.
          </Alert>
        )}

        <Grid container spacing={4}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <ProjectSkeleton />
                </Grid>
              ))
            : projects.map((project, index) => (
                <Grid item xs={12} md={4} key={project.repoName}>
                  <ProjectCard project={project} index={index} />
                </Grid>
              ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Projects;
