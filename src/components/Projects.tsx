import React from 'react';
import { Box, Container, Grid, Typography, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import SectionHeader from './ui/SectionHeader';
import DepthCard from './ui/DepthCard';
import { caseStudies } from '../config/caseStudies';
import { palette } from '../theme';

const Projects: React.FC = () => {
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
          title="Case Studies"
          subtitle="Systems I've built to understand where this is going"
          align="center"
        />

        <Grid container spacing={4}>
          {caseStudies.map((study, index) => (
            <Grid item xs={12} md={4} key={study.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                style={{ height: '100%' }}
              >
                <DepthCard sx={{ height: '100%' }}>
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Chip
                      label={study.category}
                      size="small"
                      sx={{
                        alignSelf: 'flex-start',
                        mb: 2,
                        backgroundColor: 'transparent',
                        border: `1px solid ${palette.primary.main}`,
                        color: palette.primary.main,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.65rem',
                        letterSpacing: '0.05em',
                        borderRadius: 0,
                        height: 24,
                      }}
                    />

                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 700,
                        color: palette.text.primary,
                        mb: 1.5,
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {study.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: palette.text.secondary,
                        mb: 3,
                        lineHeight: 1.6,
                        fontSize: '0.85rem',
                      }}
                    >
                      {study.context}
                    </Typography>

                    <Box sx={{ flex: 1 }}>
                      {[
                        { label: 'CHALLENGE', text: study.challenge },
                        { label: 'APPROACH', text: study.approach },
                        { label: 'OUTCOME', text: study.outcome },
                      ].map((section) => (
                        <Box key={section.label} sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
                          <Typography
                            variant="overline"
                            sx={{
                              color: palette.primary.main,
                              fontSize: '0.6rem',
                              letterSpacing: '0.15em',
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            {section.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: palette.text.secondary,
                              lineHeight: 1.6,
                              fontSize: '0.8rem',
                            }}
                          >
                            {section.text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        mt: 3,
                        pt: 2,
                        borderTop: `1px solid ${palette.border.subtle}`,
                      }}
                    >
                      {study.techStack.map((tech) => (
                        <Chip
                          key={tech}
                          label={tech}
                          size="small"
                          sx={{
                            backgroundColor: palette.background.base,
                            color: palette.text.muted,
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '0.6rem',
                            borderRadius: 0,
                            height: 22,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </DepthCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Projects;
