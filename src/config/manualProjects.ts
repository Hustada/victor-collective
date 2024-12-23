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
  'cascade': {
    repoName: 'cascade',
    title: 'Cascade AI Assistant',
    description: 'A powerful AI coding assistant that helps developers write, debug, and understand code through natural language interaction.',
    category: 'AI/ML',
    featured: true,
    order: 2,
    technologies: ['Python', 'TypeScript', 'GPT-4', 'LangChain'],
  }
};
