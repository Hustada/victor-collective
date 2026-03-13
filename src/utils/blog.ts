import matter from 'gray-matter';
import { BlogPost, BlogPostMeta } from '../types/blog';

// Blog post images
const qBotImage = '/assets/brand/blogAIDev1.jpg';
const fallacyBotImage = '/assets/brand/blogAIDev2.jpg';
const vectusAiImage = '/assets/brand/blogTypescriptDev1.jpg';
const intentEngineeringImage = '/assets/brand/blogWebDev1.jpg';

// Import blog posts
const qBotContent = require('../content/blog/q-bot.md');
const fallacyBotContent = require('../content/blog/fallacy-bot.md');
const vectusAiContent = require('../content/blog/vectus-ai.md');
const intentEngineeringContent = require('../content/blog/intent-engineering.md');

function getMarkdownContent(content: any): string {
  if (content && typeof content === 'object' && 'default' in content) {
    return content.default;
  }
  return content;
}

const blogPosts: { [key: string]: { content: string; image: string } } = {
  'q-bot': { content: getMarkdownContent(qBotContent), image: qBotImage },
  'fallacy-bot': { content: getMarkdownContent(fallacyBotContent), image: fallacyBotImage },
  'vectus-ai': { content: getMarkdownContent(vectusAiContent), image: vectusAiImage },
  'intent-engineering': {
    content: getMarkdownContent(intentEngineeringContent),
    image: intentEngineeringImage,
  },
};

// Memoize parsed blog posts — parse once, reuse on every call
let cachedPosts: BlogPostMeta[] | null = null;
let cachedFullPosts: { [slug: string]: BlogPost } = {};

function isValidSlug(slug: string): boolean {
  return slug in blogPosts;
}

export function getBlogPosts(): BlogPostMeta[] {
  if (cachedPosts) return cachedPosts;

  const posts = Object.entries(blogPosts).map(([slug, { content, image }]) => {
    try {
      const cleanContent = content.replace(/^\ufeff/, '');
      const parsed = matter(cleanContent);

      return {
        slug,
        title: parsed.data.title || '',
        date: parsed.data.date || new Date().toISOString(),
        tags: parsed.data.tags || [],
        description: parsed.data.description || '',
        coverImage: image,
      };
    } catch (error) {
      console.error(`Error parsing blog post ${slug}:`, error);
      return {
        slug,
        title: 'Error loading post',
        date: new Date().toISOString(),
        tags: [],
        description: 'This post could not be loaded',
        coverImage: '',
      };
    }
  });

  cachedPosts = posts.sort(
    (a: BlogPostMeta, b: BlogPostMeta) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return cachedPosts;
}

export function getBlogPost(slug: string): BlogPost | null {
  if (cachedFullPosts[slug]) return cachedFullPosts[slug];

  try {
    if (!isValidSlug(slug)) {
      console.warn('Invalid slug:', slug);
      return null;
    }

    const { content, image } = blogPosts[slug];
    const parsed = matter(content);

    const post: BlogPost = {
      slug,
      title: parsed.data.title || '',
      date: parsed.data.date || new Date().toISOString(),
      tags: parsed.data.tags || [],
      description: parsed.data.description || '',
      coverImage: image,
      content: parsed.content || '',
    };

    cachedFullPosts[slug] = post;
    return post;
  } catch (error) {
    console.error(`Error loading blog post ${slug}:`, error);
    return null;
  }
}

export function getBlogPostsByTag(tag: string): BlogPostMeta[] {
  const posts = getBlogPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

export function getAllTags(): string[] {
  const posts = getBlogPosts();
  const tags = new Set<string>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}
