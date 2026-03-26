import React from 'react';
import { Container, Grid, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { getBlogPosts } from '../utils/blog';
import SectionHeader from './ui/SectionHeader';
import BlogCard from './BlogCard';
import { palette } from '../theme';

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const allPosts = getBlogPosts();
  const featuredSlugs = ['intent-engineering', 'vectus-ai'];
  const posts = allPosts.filter((post) => featuredSlugs.includes(post.slug));

  return (
    <Box
      id="blog"
      sx={{
        py: 16,
        backgroundColor: palette.background.base,
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        <SectionHeader
          number="03"
          title="Blog"
          subtitle="Thoughts on AI systems, agent architecture, and production engineering"
        />

        <Grid container spacing={3}>
          {posts.map((post, index) => (
            <Grid item xs={12} md={4} key={post.slug}>
              <BlogCard post={post} index={index} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/blog')}
            endIcon={<ArrowRight size={20} weight="bold" />}
            sx={{
              px: 4,
              py: 1.5,
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
