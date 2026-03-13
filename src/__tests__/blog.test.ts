import { getBlogPosts, getBlogPost, getAllTags } from '../utils/blog';

test('getBlogPosts returns all posts', () => {
  const posts = getBlogPosts();
  expect(posts.length).toBeGreaterThan(0);
});

test('posts are sorted by date descending', () => {
  const posts = getBlogPosts();
  for (let i = 1; i < posts.length; i++) {
    expect(new Date(posts[i - 1].date).getTime()).toBeGreaterThanOrEqual(
      new Date(posts[i].date).getTime()
    );
  }
});

test('each post has a slug and date', () => {
  const posts = getBlogPosts();
  for (const post of posts) {
    expect(post.slug).toBeTruthy();
    expect(post.date).toBeTruthy();
    expect(Array.isArray(post.tags)).toBe(true);
  }
});

test('getBlogPost returns null for invalid slug', () => {
  expect(getBlogPost('nonexistent-post')).toBeNull();
});

test('getBlogPost returns post with content for valid slug', () => {
  const posts = getBlogPosts();
  const post = getBlogPost(posts[0].slug);
  expect(post).not.toBeNull();
  expect(post!.content).toBeDefined();
  expect(post!.slug).toBe(posts[0].slug);
});

test('getAllTags returns an array', () => {
  const tags = getAllTags();
  expect(Array.isArray(tags)).toBe(true);
  // Tags should be sorted if non-empty
  for (let i = 1; i < tags.length; i++) {
    expect(tags[i - 1].localeCompare(tags[i])).toBeLessThanOrEqual(0);
  }
});
