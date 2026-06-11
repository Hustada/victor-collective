import { MetadataRoute } from 'next';
import { getBlogPosts } from '../src/utils/blog';

const BASE = 'https://victorcollective.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
    ...posts,
  ];
}
