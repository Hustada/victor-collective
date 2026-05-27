import { Metadata } from 'next';
import { Container, Box, Typography } from '@mui/material';
import BlogList from '../../../../src/components/BlogList';
import { getBlogPostsByTag, getAllTags } from '../../../../src/utils/blog';

interface TagPageProps {
  params: { tag: string };
}

export function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}

export function generateMetadata({ params }: TagPageProps): Metadata {
  const tag = decodeURIComponent(params.tag);

  return {
    title: `Posts tagged "${tag}"`,
    description: `Blog posts about ${tag} from Viktor Ash at The Victor Collective.`,
    openGraph: {
      title: `Posts tagged "${tag}" | The Victor Collective`,
      description: `Blog posts about ${tag} from Viktor Ash at The Victor Collective.`,
    },
  };
}

export default function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const posts = getBlogPostsByTag(tag);

  return (
    <Container maxWidth="lg" sx={{ py: 16 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="overline" color="primary" sx={{ letterSpacing: 2 }}>
          Tag
        </Typography>
        <Typography variant="h3" component="h1" gutterBottom>
          {tag}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {posts.length} post{posts.length !== 1 ? 's' : ''} tagged with &ldquo;{tag}&rdquo;
        </Typography>
      </Box>
      <BlogList posts={posts} />
    </Container>
  );
}
