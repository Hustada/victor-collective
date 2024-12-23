import React from 'react';
import { Box, Container, Typography, IconButton, Grid } from '@mui/material';
import { GitHub, LinkedIn, Twitter } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        backgroundColor: 'primary.main',
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: "'Playfair Display', serif",
                mb: 1,
                textAlign: { xs: 'center', md: 'left' },
                color: 'secondary.main'
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
                { icon: <GitHub />, url: 'https://github.com' },
                { icon: <LinkedIn />, url: 'https://linkedin.com' },
                { icon: <Twitter />, url: 'https://twitter.com' }
              ].map((social, index) => (
                <IconButton
                  key={index}
                  component={motion.a}
                  whileHover={{ scale: 1.2 }}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'white',
                    mx: 1,
                    '&:hover': {
                      color: 'secondary.main'
                    }
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography 
              variant="body2" 
              sx={{ 
                textAlign: { xs: 'center', md: 'right' },
                opacity: 0.8
              }}
            >
              &copy; {new Date().getFullYear()} <Box component="span" sx={{ color: 'secondary.main' }}>The Victor Collective</Box>
              <br />
              All rights reserved
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
