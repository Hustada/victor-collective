import React, { useLayoutEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlogPost from '../components/BlogPost';
import { getBlogPost } from '../utils/blog';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const post = typeof slug === 'string' ? getBlogPost(slug) : null;

  // Use useLayoutEffect to scroll before browser paints
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!post) {
    return (
      <Container id="top" maxWidth="lg" sx={{ py: 8 }}>
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
    <Container id="top" maxWidth="lg" sx={{ py: 8 }}>
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
