import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { GitHub, LinkedIn, Twitter } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'black',
        color: 'white',
        py: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: 'primary.main',
                fontFamily: "'Playfair Display', serif",
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              The Victor Collective
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.8,
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              Innovating at the intersection of AI and web development
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 1 }}>
              {[
                { icon: <GitHub />, url: 'https://github.com/hustada' },
                { icon: <LinkedIn />, url: 'https://linkedin.com' },
                { icon: <Twitter />, url: 'https://twitter.com' }
              ].map((social, index) => (
                <Link
                  key={index}
                  component={motion.a}
                  whileHover={{ scale: 1.2 }}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'white',
                    mx: 1,
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {social.icon}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'grey.400',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              &copy; {new Date().getFullYear()} The Victor Collective
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'grey.400',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              All rights reserved
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
