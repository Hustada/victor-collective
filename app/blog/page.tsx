import { Metadata } from 'next';
import { Container, Box } from '@mui/material';
import BlogList from '../../src/components/BlogList';
import { getBlogPosts } from '../../src/utils/blog';
import SectionHeader from '../../src/components/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Thoughts on AI systems, agent architecture, and production engineering from Viktor Ash.',
  openGraph: {
    title: 'Blog | The Victor Collective',
    description:
      'Thoughts on AI systems, agent architecture, and production engineering from Viktor Ash.',
  },
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <Container maxWidth="lg" sx={{ py: 16 }}>
      <SectionHeader
        number="01"
        title="Blog"
        subtitle="Thoughts on AI systems, agent architecture, and production engineering"
      />
      <Box sx={{ mt: 6 }}>
        <BlogList posts={posts} />
      </Box>
    </Container>
  );
}
