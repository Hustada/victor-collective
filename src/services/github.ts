interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  topics: string[];
  language: string;
  stargazers_count: number;
  homepage: string | null;
}

export async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    if (!response.ok) throw new Error('Failed to fetch repos');
    return response.json();
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
}

export async function fetchRepoTopics(username: string, repo: string): Promise<string[]> {
  try {
    const response = await fetch(`https://api.github.com/repos/${username}/${repo}/topics`, {
      headers: {
        'Accept': 'application/vnd.github.mercy-preview+json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch topics');
    const data = await response.json();
    return data.names || [];
  } catch (error) {
    console.error('Error fetching repo topics:', error);
    return [];
  }
}
