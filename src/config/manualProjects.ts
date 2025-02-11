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
  'vectus-ai': {
    repoName: 'vectus-ai',
    title: 'Vectus AI',
    description: 'Intelligent medical scheduling assistant that leverages natural language processing for seamless appointment management. Features real-time availability checking and contextual conversation memory.',
    category: 'AI/ML',
    featured: true,
    order: 1,
    liveUrl: 'https://vectus-ai.vercel.app',
    technologies: ['Node.js', 'Express', 'OpenAI GPT-4', 'JavaScript', 'Real-time Processing'],
  },
  'fallacy-bot': {
    repoName: 'fallacy-bot',
    title: 'Fallacy Bot',
    description: 'Advanced AI system for detecting and explaining logical fallacies in text. Features comprehensive fallacy detection, educational feedback, and an interactive testing dashboard.',
    category: 'AI/ML',
    featured: true,
    order: 2,
    githubUrl: 'https://github.com/Hustada/fallacy-bot',
    technologies: ['Python', 'Streamlit', 'OpenAI GPT-3.5', 'SQLite', 'Machine Learning'],
  },
  'q-bot': {
    repoName: 'q-bot',
    title: 'Q Bot',
    description: 'AI-powered social media bot that generates and posts Star Trek Q character-themed content. Showcases creative content generation and automated social media management.',
    category: 'AI/ML',
    featured: true,
    order: 3,
    githubUrl: 'https://github.com/Hustada/Q-AI-X-Bot',
    technologies: ['Python', 'OpenAI GPT', 'Twitter API', 'Automation', 'NLP'],
  }
};
