import React from 'react';
import { Box, Typography, Chip, Container } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { BlogPost as BlogPostType } from '../types/blog';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface BlogPostProps {
  post: BlogPostType;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {post.title}
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {format(new Date(post.date), 'MMMM d, yyyy')}
        </Typography>

        <Box sx={{ mb: 4 }}>
          {post.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => navigate(`/blog/tag/${tag}`)}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>

        {post.coverImage && (
          <Box
            component="img"
            src={post.coverImage}
            alt={post.title}
            sx={{
              width: '100%',
              height: 400,
              objectFit: 'cover',
              borderRadius: 1,
              mb: 4,
            }}
          />
        )}

        <Box sx={{
          '& img': {
            maxWidth: '100%',
            height: 'auto',
          },
          '& pre': {
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          },
          '& code': {
            fontFamily: 'monospace',
          },
          '& blockquote': {
            borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
            margin: 0,
            pl: 2,
            py: 1,
          },
        }}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </Box>
      </Box>
    </Container>
  );
};

export default BlogPost;
