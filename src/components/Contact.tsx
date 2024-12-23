import React from 'react';
import { Box, Container, Typography, TextField, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <Box
      id="contact"
      component={motion.section}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      sx={{
        py: 8,
        backgroundColor: 'background.paper'
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          sx={{
            mb: 6,
            textAlign: 'center',
            color: 'text.primary'
          }}
        >
          Contact Me
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{
            mt: 3,
            '& .MuiTextField-root': { mb: 2 }
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Name"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                variant="outlined"
                type="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Message"
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Button
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                px: 4,
                py: 1.5
              }}
            >
              Send Message
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;
