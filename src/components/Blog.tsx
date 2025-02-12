import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  useTheme,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getBlogPosts } from '../utils/blog';
import { format } from 'date-fns';

const Blog: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const posts = getBlogPosts();

  return (
    <Box
      id="blog"
      component="section"
      sx={{
        py: 8,
        backgroundColor: 'background.default',
        borderBottom: `1px solid ${theme.palette.divider}`,
        mb: 8
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h2"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 'bold',
              color: theme.palette.text.primary,
            }}
          >
            Blog
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {posts.map((post, index) => (
            <Grid item xs={12} md={4} key={post.slug}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                    minHeight: { xs: 'auto', md: 500 }, // Responsive minimum height
                  }}
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate(`/blog/${post.slug}`);
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={post.coverImage}
                    alt={post.title}
                    sx={{
                      objectFit: 'cover',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 2,
                    p: 3 // Add consistent padding
                  }}>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h3"
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.25rem', md: '1.5rem' }, // Responsive font size
                        lineHeight: 1.2,
                        mb: 1
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block' }}
                    >
                      {format(new Date(post.date), 'MMMM d, yyyy')}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {post.description}
                    </Typography>
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      {post.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/blog/tag/${tag}`);
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/blog')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
            }}
          >
            View All Posts
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Blog;
