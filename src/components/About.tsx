import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  useTheme 
} from '@mui/material';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const theme = useTheme();

  // Skill items with icons and descriptions
  const skills = [
    { 
      name: 'AI/ML', 
      level: 85, 
      icon: '🤖',
      description: 'LangChain, OpenAI, TensorFlow',
      color: '#00A67E' // Green for AI
    },
    { 
      name: 'React & TypeScript', 
      level: 90, 
      icon: '⚛️',
      description: 'Next.js, Material-UI, Framer Motion',
      color: '#61DAFB' // React blue
    },
    { 
      name: 'Python Development', 
      level: 88, 
      icon: '🐍',
      description: 'FastAPI, Django, Data Science',
      color: '#3776AB' // Python blue
    },
    { 
      name: 'Full Stack', 
      level: 82, 
      icon: '🚀',
      description: 'Node.js, PostgreSQL, AWS',
      color: '#FF6B6B' // Coral red
    },
  ];

  return (
    <Box 
      id="about"
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
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 10, 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Grid 
          container 
          spacing={4} 
          alignItems="center"
        >
          {/* Profile Image Column */}
          <Grid 
            item 
            xs={12} 
            md={5} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ 
                opacity: 1, 
                scale: 1,
                transition: { 
                  duration: 0.8,
                  ease: "easeInOut"
                }
              }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  width: { xs: 250, md: 280 },
                  height: { xs: 250, md: 280 },
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  border: '4px solid',
                  borderColor: 'secondary.main',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <img 
                  src="/assets/brand/profile.jpg" 
                  alt="Victor Profile" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </motion.div>
          </Grid>

          {/* About Text Column */}
          <Grid 
            item 
            xs={12} 
            md={7}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
              pl: { md: 4 }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  duration: 0.8,
                  ease: "easeInOut"
                }
              }}
              viewport={{ once: true }}
            >
              <Typography 
                variant="h3" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 3 
                }}
              >
                About Me
              </Typography>

              <Typography 
                variant="body1" 
                paragraph 
                sx={{ 
                  color: 'text.secondary', 
                  lineHeight: 1.6,
                  mb: 2 
                }}
              >
                I'm a passionate AI and web development professional dedicated to creating innovative digital solutions. 
                With a deep understanding of cutting-edge technologies, I transform complex ideas into elegant, functional experiences.
              </Typography>

              <Typography 
                variant="body1" 
                paragraph 
                sx={{ 
                  color: 'text.secondary', 
                  lineHeight: 1.6 
                }}
              >
                My approach combines technical expertise with creative problem-solving, 
                ensuring that every project not only meets but exceeds expectations.
              </Typography>
            </motion.div>
          </Grid>
        </Grid>

        {/* Section Separator */}
        <Box sx={{ height: '2px', backgroundColor: 'secondary.main', my: 6 }} />

        {/* Skills Section */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              mb: 4,
              textAlign: 'center',
              color: 'text.primary'
            }}
          >
            Technical Expertise
          </Typography>
          <Grid container spacing={3}>
            {skills.map((skill, index) => (
              <Grid item xs={12} key={skill.name}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { 
                      duration: 0.5,
                      delay: index * 0.1
                    }
                  }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ mb: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1,
                        color: 'text.primary'
                      }}
                    >
                      <span>{skill.icon}</span>
                      {skill.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        ml: 4 
                      }}
                    >
                      {skill.description}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      height: 8,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ 
                        width: `${skill.level}%`,
                        transition: { 
                          duration: 1,
                          delay: index * 0.1
                        }
                      }}
                      viewport={{ once: true }}
                      style={{
                        height: '100%',
                        backgroundColor: skill.color,
                        borderRadius: 4
                      }}
                    />
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default About;
