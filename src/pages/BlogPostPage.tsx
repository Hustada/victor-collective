import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlogPost from '../components/BlogPost';
import { getBlogPost } from '../utils/blog';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = typeof slug === 'string' ? getBlogPost(slug) : null;

  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/blog')}
          sx={{ mb: 4 }}
        >
          Back to Blog
        </Button>
        <div>Post not found</div>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/blog')}
        sx={{ mb: 4 }}
      >
        Back to Blog
      </Button>
      <BlogPost post={post} />
    </Container>
  );
};

export default BlogPostPage;
