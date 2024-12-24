import matter from 'gray-matter';
import { BlogPost, BlogPostMeta } from '../types/blog';
import {
  masteringReactHooks,
  buildingModernPortfolio,
  futureOfWebDevelopment,
} from '../content/blog';

export type BlogSlug = 'mastering-react-hooks' | 'building-modern-portfolio' | 'future-of-web-development';

type BlogPosts = {
  [K in BlogSlug]: string;
};

// Map blog posts
const blogPosts: BlogPosts = {
  'mastering-react-hooks': masteringReactHooks,
  'building-modern-portfolio': buildingModernPortfolio,
  'future-of-web-development': futureOfWebDevelopment,
};

function isValidSlug(slug: string): slug is BlogSlug {
  return Object.keys(blogPosts).includes(slug);
}

export function getBlogPosts(): BlogPostMeta[] {
  const posts = Object.entries(blogPosts).map(([slug, content]) => {
    try {
      const parsed = matter(content);
      
      return {
        slug,
        title: parsed.data.title || '',
        date: parsed.data.date || new Date().toISOString(),
        tags: parsed.data.tags || [],
        description: parsed.data.description || '',
        coverImage: parsed.data.coverImage || '',
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
    
    const content = blogPosts[slug];
    if (!content) {
      console.log('No content for slug:', slug);
      return null;
    }

    const parsed = matter(content);

    return {
      slug,
      title: parsed.data.title || '',
      date: parsed.data.date || new Date().toISOString(),
      tags: parsed.data.tags || [],
      description: parsed.data.description || '',
      coverImage: parsed.data.coverImage || '',
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
