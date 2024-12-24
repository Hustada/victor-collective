import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlogList from '../components/BlogList';
import { getBlogPostsByTag } from '../utils/blog';

const BlogTagPage: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const posts = tag ? getBlogPostsByTag(tag) : [];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/blog')}
        sx={{ mb: 4 }}
      >
        Back to Blog
      </Button>
      <Typography variant="h2" component="h1" gutterBottom>
        Posts tagged "{tag}"
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        {posts.length} post{posts.length === 1 ? '' : 's'} found
      </Typography>
      <Box sx={{ mt: 4 }}>
        <BlogList posts={posts} />
      </Box>
    </Container>
  );
};

export default BlogTagPage;
