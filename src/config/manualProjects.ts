import { ProjectCategory } from '../services/github';

export interface ManualProject {
  repoName: string;
  title: string;
  description: string;
  category: ProjectCategory;
  featured: boolean;
  liveUrl?: string;
  githubUrl?: string;
  order?: number;
  technologies?: string[];
}

export const manualProjects: Record<string, ManualProject> = {
  'metacraft': {
    repoName: 'metacraft',
    title: 'MetaCraft AI',
    description: 'An innovative AI-powered platform for building and deploying intelligent applications.',
    category: 'AI/ML',
    featured: true,
    order: 1,
    liveUrl: 'https://metacraft-beta.vercel.app',
    technologies: ['React', 'TypeScript', 'OpenAI', 'Next.js'],
  },
  'q-bot': {
    repoName: 'q-bot',
    title: 'Q Bot',
    description: 'An AI-powered Discord bot that helps manage server queues and provides interactive features for community engagement.',
    category: 'AI/ML',
    featured: true,
    order: 2,
    githubUrl: 'https://github.com/Hustada/Q-AI-X-Bot',
    technologies: ['Python', 'Discord.py', 'OpenAI', 'MongoDB'],
  }
};
