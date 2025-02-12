import matter from 'gray-matter';
import { BlogPost, BlogPostMeta } from '../types/blog';

// Blog post images
const qBotImage = '/assets/brand/blogAIDev1.jpg';
const fallacyBotImage = '/assets/brand/blogAIDev2.jpg';
const vectusAiImage = '/assets/brand/blogTypescriptDev1.jpg';

// Import blog posts
const qBotContent = require('../content/blog/q-bot.md');
const fallacyBotContent = require('../content/blog/fallacy-bot.md');
const vectusAiContent = require('../content/blog/vectus-ai.md');

function getMarkdownContent(content: any): string {
  // If content is a module with a default export, use that
  if (content && typeof content === 'object' && 'default' in content) {
    return content.default;
  }
  // Otherwise use the content directly
  return content;
}

const blogPosts: { [key: string]: { content: string; image: string } } = {
  'q-bot': { content: getMarkdownContent(qBotContent), image: qBotImage },
  'fallacy-bot': { content: getMarkdownContent(fallacyBotContent), image: fallacyBotImage },
  'vectus-ai': { content: getMarkdownContent(vectusAiContent), image: vectusAiImage }
};

function isValidSlug(slug: string): boolean {
  return slug in blogPosts;
}

export function getBlogPosts(): BlogPostMeta[] {
  const posts = Object.entries(blogPosts).map(([slug, { content, image }]) => {
    try {
      console.log(`Raw content for ${slug}:`, content);
      // Remove any BOM characters that might be present
      const cleanContent = content.replace(/^\ufeff/, '');
      console.log(`Clean content for ${slug}:`, cleanContent);
      const parsed = matter(cleanContent);
      console.log(`Parsed data for ${slug}:`, parsed);
      
      const meta = {
        slug,
        title: parsed.data.title || '',
        date: parsed.data.date || new Date().toISOString(),
        tags: parsed.data.tags || [],
        description: parsed.data.description || '',
        coverImage: image,
      };
      console.log('Blog post meta:', meta);
      return meta;
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

  return posts.sort((a: BlogPostMeta, b: BlogPostMeta) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getBlogPost(slug: string): BlogPost | null {
  try {
    if (!isValidSlug(slug)) {
      console.log('Invalid slug:', slug);
      return null;
    }
    
    const { content, image } = blogPosts[slug];
    const parsed = matter(content);

    return {
      slug,
      title: parsed.data.title || '',
      date: parsed.data.date || new Date().toISOString(),
      tags: parsed.data.tags || [],
      description: parsed.data.description || '',
      coverImage: image,
      content: parsed.content || '',
    };
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
