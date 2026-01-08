import React from 'react';
import { Container, Grid, Typography, Button, Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { alpha } from '@mui/material/styles';
import { getBlogPosts } from '../utils/blog';
import { format } from 'date-fns';
import SectionHeader from './ui/SectionHeader';
import { palette } from '../theme';

const BlogCard: React.FC<{
  post: {
    slug: string;
    title: string;
    description: string;
    date: string;
    coverImage: string;
    tags: string[];
  };
  index: number;
}> = ({ post, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Box
        onClick={() => {
          window.scrollTo(0, 0);
          navigate(`/blog/${post.slug}`);
        }}
        sx={{
          cursor: 'pointer',
          p: 3,
          background: palette.background.elevated,
          border: `1px solid ${palette.border.subtle}`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: palette.primary.main,
            transform: 'translateY(-4px)',
            '& .post-arrow': {
              transform: 'translateX(4px)',
            },
            '& .post-number': {
              color: palette.primary.main,
            },
          },
          // Corner accent
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, transparent 50%, ${alpha(palette.primary.main, 0.1)} 50%)`,
          },
        }}
      >
        {/* Post number/date */}
        <Typography
          className="post-number"
          variant="caption"
          sx={{
            color: palette.text.muted,
            mb: 1,
            transition: 'color 0.2s',
            display: 'block',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.75rem',
          }}
        >
          {`${format(new Date(post.date), 'yyyy.MM.dd')} // #${(index + 1).toString().padStart(3, '0')}`}
        </Typography>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '1.25rem',
            fontWeight: 600,
            mb: 2,
            color: 'text.primary',
            lineHeight: 1.3,
          }}
        >
          {post.title}
        </Typography>

        {/* Excerpt */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 3,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.description}
        </Typography>

        {/* Tags */}
        <Box sx={{ mb: 3 }}>
          {post.tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/blog/tag/${tag}`);
              }}
              sx={{
                mr: 1,
                mb: 1,
                fontSize: '0.7rem',
                height: 24,
                backgroundColor: alpha(palette.primary.main, 0.1),
                color: palette.primary.light,
                border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
                '&:hover': {
                  backgroundColor: alpha(palette.primary.main, 0.2),
                },
              }}
            />
          ))}
        </Box>

        {/* Read more */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: palette.primary.main,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
            }}
          >
            READ MORE
          </Typography>
          <ArrowRight
            className="post-arrow"
            size={16}
            color={palette.primary.main}
            weight="bold"
            style={{ transition: 'transform 0.2s' }}
          />
        </Box>
      </Box>
    </motion.div>
  );
};

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const posts = getBlogPosts();

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
          subtitle="Thoughts on development, AI, and building digital products"
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
