import React, { useState } from 'react';
import { Box, CardContent, Chip, Stack, IconButton, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { GithubLogo, ArrowSquareOut } from '@phosphor-icons/react';
import { alpha } from '@mui/material/styles';
import DepthCard from './ui/DepthCard';
import { palette } from '../theme';
import { ProjectData } from '../hooks/useProjects';

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
            loading="lazy"
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
                  aria-label={`View ${project.title} on GitHub`}
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
                  aria-label={`Visit ${project.title} live site`}
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
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
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

export default ProjectCard;
