import React from 'react';
import { Box, Typography, Chip, Container } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
          '& h1, & h2, & h3, & h4': {
            mt: 4,
            mb: 2,
          },
          '& p': {
            mb: 2,
            lineHeight: 1.8,
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          '& pre': {
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            mb: 2,
          },
          '& code': {
            fontFamily: 'monospace',
            fontSize: '0.9em',
          },
          '& :not(pre) > code': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            px: 0.75,
            py: 0.25,
            borderRadius: 0.5,
          },
          '& blockquote': {
            borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
            margin: 0,
            mb: 2,
            pl: 2,
            py: 1,
            '& p': {
              mb: 0,
            },
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            mb: 3,
            mt: 1,
            overflow: 'hidden',
            borderRadius: 1,
            border: (theme) =>
              theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
          },
          '& thead': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          },
          '& th': {
            textAlign: 'left',
            px: 2,
            py: 1.5,
            fontWeight: 600,
            fontSize: '0.875rem',
            borderBottom: (theme) =>
              theme.palette.mode === 'dark' ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(0, 0, 0, 0.15)',
          },
          '& td': {
            px: 2,
            py: 1.5,
            fontSize: '0.875rem',
            lineHeight: 1.6,
            borderBottom: (theme) =>
              theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
          },
          '& tbody tr:hover': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          },
          '& tbody tr:last-child td': {
            borderBottom: 'none',
          },
          '& ul, & ol': {
            mb: 2,
            pl: 3,
          },
          '& li': {
            mb: 0.5,
            lineHeight: 1.7,
          },
          '& strong': {
            fontWeight: 600,
          },
          '& hr': {
            border: 'none',
            borderTop: (theme) =>
              theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
            my: 4,
          },
        }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </Box>
      </Box>
    </Container>
  );
};

export default BlogPost;
