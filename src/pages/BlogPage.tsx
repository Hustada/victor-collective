import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import BlogList from '../components/BlogList';
import { getBlogPosts } from '../utils/blog';

const BlogPage: React.FC = () => {
  const posts = getBlogPosts();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Blog
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Thoughts, tutorials, and insights about web development and design
      </Typography>
      <Box sx={{ mt: 4 }}>
        <BlogList posts={posts} />
      </Box>
    </Container>
  );
};

export default BlogPage;
