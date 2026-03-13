import React from 'react';
import { Box, Card, CardContent, Typography, Chip, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { BlogPostMeta } from '../types/blog';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface BlogListProps {
  posts: BlogPostMeta[];
}

const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3} alignItems="stretch">
      {posts.map((post) => (
        <Grid item xs={12} md={6} lg={4} key={post.slug}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ height: '100%' }}
          >
            <Card
              onClick={() => navigate(`/blog/${post.slug}`)}
              sx={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[4],
                },
              }}
            >
              <Box
                sx={{
                  height: 200,
                  flexShrink: 0,
                  backgroundImage: `url(${post.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h5" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {format(new Date(post.date), 'MMMM d, yyyy')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.description}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
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
  );
};

export default BlogList;
