import { useState, useEffect, useCallback } from 'react';
import { projectsConfig } from '../config/projectsConfig';
import { manualProjects } from '../config/manualProjects';
import { fetchGithubRepos, ProjectCategory } from '../services/github';
import { getRandomImage } from '../utils/imageUtils';

export interface ProjectData {
  repoName: string;
  title: string;
  description: string;
  category: ProjectCategory;
  image: string;
  githubUrl: string;
  technologies: string[];
  featured: boolean;
  order?: number;
  liveUrl?: string;
}

const CACHE_KEY = 'portfolio_projects';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function getCachedProjects(): ProjectData[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedProjects(projects: ProjectData[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: projects, timestamp: Date.now() }));
  } catch {
    // sessionStorage full or unavailable
  }
}

function dedupeAndSort(projects: ProjectData[], limit = 6): ProjectData[] {
  return projects
    .filter((project): project is ProjectData => project !== null)
    .reduce((unique, project) => {
      if (!unique.find((p) => p.repoName === project.repoName)) {
        unique.push(project);
      }
      return unique;
    }, [] as ProjectData[])
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.order || 99) - (b.order || 99);
    })
    .slice(0, limit);
}

function buildFallbackProjects(): ProjectData[] {
  const fromConfig = Object.values(projectsConfig).map((config) => ({
    ...config,
    repoName: config.repoName,
    githubUrl: `https://github.com/hustada/${config.repoName}`,
    technologies: ['React', 'TypeScript'],
    image: getRandomImage(config.category),
    featured: config.featured ?? false,
  }));

  const fromManual = Object.values(manualProjects).map((project) => ({
    ...project,
    repoName: project.repoName,
    githubUrl: project.githubUrl || `https://github.com/hustada/${project.repoName}`,
    image: getRandomImage(project.category),
    featured: project.featured ?? false,
    technologies: project.technologies || [],
  }));

  return dedupeAndSort([...fromConfig, ...fromManual]);
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    const cached = getCachedProjects();
    if (cached) {
      setProjects(cached);
      setLoading(false);
      return;
    }

    try {
      const repos = await fetchGithubRepos('hustada');

      const githubProjects = repos.map((repo) => {
        const config = projectsConfig[repo.name];
        const manual = manualProjects[repo.name];

        const baseProject = manual ||
          config || {
            repoName: repo.name,
            title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            description: repo.description || '',
            featured: false,
            order: 99,
          };

        const category = manual?.category || config?.category || repo.category;

        return {
          ...baseProject,
          category,
          githubUrl: manual?.githubUrl || repo.html_url,
          technologies: manual?.technologies || [repo.language, ...repo.topics].filter(Boolean),
          image: getRandomImage(category),
          liveUrl: config?.liveUrl || manual?.liveUrl || repo.homepage || undefined,
          featured: baseProject.featured ?? false,
        } as ProjectData;
      });

      // Add manual-only projects
      const manualOnlyProjects = Object.entries(manualProjects)
        .filter(([name]) => !repos.find((repo) => repo.name === name))
        .map(
          ([name, project]): ProjectData => ({
            ...project,
            repoName: project.repoName || name,
            image: getRandomImage(project.category),
            featured: project.featured ?? false,
            githubUrl: project.githubUrl || `https://github.com/hustada/${project.repoName}`,
            technologies: project.technologies || [],
          })
        );

      const allProjects = dedupeAndSort([...githubProjects, ...manualOnlyProjects]);
      setCachedProjects(allProjects);
      setProjects(allProjects);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects from GitHub.');
      setProjects(buildFallbackProjects());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return { projects, loading, error, retry: loadProjects };
}
