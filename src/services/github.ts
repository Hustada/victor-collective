interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  topics: string[];
  language: string;
  stargazers_count: number;
  homepage: string | null;
  category: ProjectCategory;
}

export type ProjectCategory = 'AI/ML' | 'React' | 'Full Stack' | 'Python';

// Helper function to determine project category based on topics and language
export function determineProjectCategory(topics: string[], language: string): ProjectCategory {
  const normalizedTopics = topics.map(t => t.toLowerCase());
  
  // Check for AI/ML indicators
  if (normalizedTopics.some(topic => 
    ['ai', 'ml', 'machine-learning', 'artificial-intelligence', 'gpt', 'nlp', 'deep-learning']
    .includes(topic))) {
    return 'AI/ML';
  }
  
  // Check for React
  if (language === 'TypeScript' || language === 'JavaScript') {
    if (normalizedTopics.some(topic => 
      ['react', 'nextjs', 'react-native', 'frontend']
      .includes(topic))) {
      return 'React';
    }
  }
  
  // Check for Python
  if (language === 'Python') {
    return 'Python';
  }
  
  // Default to Full Stack
  return 'Full Stack';
}

const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;

export async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };

    // Add authorization header if token is available
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      { headers }
    );

    if (!response.ok) {
      console.error('GitHub API Error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error('Failed to fetch repos');
    }
    
    const repos = await response.json();
    
    // Fetch topics for each repo
    const reposWithTopics = await Promise.all(
      repos.map(async (repo: GithubRepo) => {
        const topics = await fetchRepoTopics(username, repo.name);
        return { ...repo, topics, category: determineProjectCategory(topics, repo.language) };
      })
    );
    
    return reposWithTopics;
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
}

export async function fetchRepoTopics(username: string, repo: string): Promise<string[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.mercy-preview+json'
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${username}/${repo}/topics`,
      { headers }
    );

    if (!response.ok) throw new Error('Failed to fetch topics');
    const data = await response.json();
    return data.names || [];
  } catch (error) {
    console.error('Error fetching repo topics:', error);
    return [];
  }
}
