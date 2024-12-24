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
} from '@mui/material';
import { motion } from 'framer-motion';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
}

const samplePosts: BlogPost[] = [
  {
    id: 1,
    title: 'The Future of Web Development',
    excerpt: 'Exploring emerging trends in web development and what they mean for developers.',
    date: 'December 23, 2024',
    image: '/assets/brand/blogWebDev1.jpg',
    category: 'Web Development'
  },
  {
    id: 2,
    title: 'AI in Modern Development',
    excerpt: 'How artificial intelligence is transforming the way we build applications.',
    date: 'December 22, 2024',
    image: '/assets/brand/blogAIDev1.jpg',
    category: 'AI Development'
  },
  {
    id: 3,
    title: 'React Development Best Practices',
    excerpt: 'Essential practices for building efficient and maintainable React applications.',
    date: 'December 21, 2024',
    image: '/assets/brand/blogReactDev1.jpg',
    category: 'React'
  }
];

const Blog: React.FC = () => {
  const theme = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <Container maxWidth="lg" id="blog" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary
            }}
          >
            Latest Insights
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            Thoughts, tutorials, and perspectives on modern web development
          </Typography>
        </motion.div>
      </Box>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Grid container spacing={4}>
          {samplePosts.map((post) => (
            <Grid item xs={12} md={4} key={post.id}>
              <motion.div variants={itemVariants} style={{ height: '100%' }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={post.image}
                    alt={post.title}
                    sx={{
                      objectFit: 'cover',
                    }}
                  />
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}>
                    <Typography
                      variant="overline"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    >
                      {post.category}
                    </Typography>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mt: 1,
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        mb: 2,
                        flexGrow: 1
                      }}
                    >
                      {post.excerpt}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        mt: 'auto'
                      }}
                    >
                      {post.date}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button
          variant="outlined"
          color="primary"
          size="large"
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
  );
};

export default Blog;
