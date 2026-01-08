import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  CardContent,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { GithubLogo, ArrowSquareOut } from '@phosphor-icons/react';
import { alpha } from '@mui/material/styles';
import SectionHeader from './ui/SectionHeader';
import DepthCard from './ui/DepthCard';
import { projectsConfig } from '../config/projectsConfig';
import { manualProjects } from '../config/manualProjects';
import { fetchGithubRepos, ProjectCategory } from '../services/github';
import { getRandomImage } from '../utils/imageUtils';
import { palette } from '../theme';

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

const ProjectCard: React.FC<{ project: ProjectData; index: number }> = ({ project, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <DepthCard shadowOffset={10} hoverLift={12}>
        {/* Image container */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            aspectRatio: '16/10',
          }}
        >
          <motion.img
            src={project.image}
            alt={project.title}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Hover overlay with action buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to top, ${alpha(palette.background.void, 0.95)} 0%, transparent 100%)`,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              padding: 16,
            }}
          >
            <Stack direction="row" spacing={1}>
              {project.githubUrl && (
                <IconButton
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: palette.text.primary,
                    background: alpha(palette.primary.main, 0.2),
                    border: `1px solid ${alpha(palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: palette.primary.main,
                      color: palette.background.void,
                    },
                  }}
                >
                  <GithubLogo size={20} weight="bold" />
                </IconButton>
              )}
              {project.liveUrl && (
                <IconButton
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: palette.text.primary,
                    background: alpha(palette.primary.main, 0.2),
                    border: `1px solid ${alpha(palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: palette.primary.main,
                      color: palette.background.void,
                    },
                  }}
                >
                  <ArrowSquareOut size={20} weight="bold" />
                </IconButton>
              )}
            </Stack>
          </motion.div>

          {/* Category badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
            }}
          >
            <Chip
              label={project.category}
              size="small"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                backgroundColor: alpha(palette.background.void, 0.8),
                color: palette.primary.main,
                border: `1px solid ${alpha(palette.primary.main, 0.3)}`,
                backdropFilter: 'blur(8px)',
              }}
            />
          </Box>
        </Box>

        {/* Card content */}
        <CardContent sx={{ p: 3 }}>
          {/* Tech stack chips */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
          >
            {project.technologies.slice(0, 4).map((tech) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  height: 24,
                  backgroundColor: alpha(palette.primary.main, 0.1),
                  color: palette.primary.light,
                  border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
                }}
              />
            ))}
          </Stack>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              fontSize: '1.25rem',
              mb: 1.5,
              color: 'text.primary',
            }}
          >
            {project.title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.description}
          </Typography>
        </CardContent>
      </DepthCard>
    </motion.div>
  );
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const repos = await fetchGithubRepos('hustada');

        const githubProjects = repos.map((repo) => {
          const config = projectsConfig[repo.name];
          const manual = manualProjects[repo.name];

          const baseProject = manual ||
            config || {
              repoName: repo.name,
              title: repo.name
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase()),
              description: repo.description || '',
              featured: false,
              order: 99,
            };

          const category = manual?.category || config?.category || repo.category;

          const project: ProjectData = {
            ...baseProject,
            category,
            githubUrl: manual?.githubUrl || repo.html_url,
            technologies: manual?.technologies ||
              [repo.language, ...repo.topics].filter(Boolean),
            image: getRandomImage(category),
            liveUrl:
              config?.liveUrl || manual?.liveUrl || repo.homepage || undefined,
            featured: baseProject.featured ?? false,
          };

          return project;
        });

        // Add manual-only projects
        const manualOnlyProjects = Object.entries(manualProjects)
          .filter(([name]) => !repos.find((repo) => repo.name === name))
          .map(
            ([name, project]): ProjectData => ({
              ...project,
              repoName: project.repoName || name,
              image: getRandomImage(project.category),
              featured: project.featured ?? false,
              githubUrl:
                project.githubUrl ||
                `https://github.com/hustada/${project.repoName}`,
              technologies: project.technologies || [],
            })
          );

        // Combine and sort all projects
        const allProjects = [...githubProjects, ...manualOnlyProjects]
          .filter((project): project is ProjectData => project !== null)
          .reduce((unique, project) => {
            const existingProject = unique.find(
              (p) => p.repoName === project.repoName
            );
            if (!existingProject) {
              unique.push(project);
            }
            return unique;
          }, [] as ProjectData[])
          .sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return (a.order || 99) - (b.order || 99);
          })
          .slice(0, 3);

        setProjects(allProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
        // Fallback to manual projects
        const fallbackProjects = [
          ...Object.values(projectsConfig).map((config) => ({
            ...config,
            repoName: config.repoName,
            githubUrl: `https://github.com/hustada/${config.repoName}`,
            technologies: ['React', 'TypeScript'],
            image: getRandomImage(config.category),
            featured: config.featured ?? false,
          })),
          ...Object.values(manualProjects).map((project) => ({
            ...project,
            repoName: project.repoName,
            githubUrl:
              project.githubUrl ||
              `https://github.com/hustada/${project.repoName}`,
            image: getRandomImage(project.category),
            featured: project.featured ?? false,
            technologies: project.technologies || [],
          })),
        ]
          .reduce((unique, project) => {
            const existingProject = unique.find(
              (p) => p.repoName === project.repoName
            );
            if (!existingProject) {
              unique.push(project);
            }
            return unique;
          }, [] as ProjectData[])
          .sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return (a.order || 99) - (b.order || 99);
          })
          .slice(0, 3);

        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          backgroundColor: palette.background.elevated,
        }}
      >
        <CircularProgress sx={{ color: palette.primary.main }} />
      </Box>
    );
  }

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

        <Grid container spacing={4}>
          {projects.map((project, index) => (
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
