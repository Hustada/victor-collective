import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPost from '../../../src/components/BlogPost';
import { getBlogPost, getBlogPosts } from '../../../src/utils/blog';

interface BlogPostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: `${post.title} | The Victor Collective`,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: ['Viktor Ash'],
      tags: post.tags,
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return <BlogPost post={post} />;
}
