import React from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2" sx={{ mb: { xs: 2, sm: 0 } }}>
            © {new Date().getFullYear()} Your Name. All rights reserved.
          </Typography>
          <Box>
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
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
