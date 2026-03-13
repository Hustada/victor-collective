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
  'alvis-v2': {
    repoName: 'alvis-v2',
    title: 'Alvis',
    description: 'Autonomous personal AI assistant with multi-agent architecture. Features self-improving sub-agents that scan the codebase, write tests, and ship pull requests without human intervention. Built with intent engineering research to steer agent decision-making across LLM providers.',
    category: 'AI/ML',
    featured: true,
    order: 1,
    technologies: ['Python', 'FastAPI', 'Claude', 'OpenAI', 'Gemini', 'SQLite', 'React', 'Docker'],
  },
  'stacks': {
    repoName: 'stacks',
    title: 'Stakks',
    description: 'Full-stack task and habit tracking app with cross-platform support. Web PWA and native iOS app sharing a Firebase backend. Features streak tracking, confetti animations, and offline-first architecture.',
    category: 'Full Stack',
    featured: true,
    order: 2,
    technologies: ['React', 'React Native', 'TypeScript', 'Firebase', 'Expo', 'Tailwind CSS'],
  },
  'kodeskald': {
    repoName: 'kodeskald',
    title: 'Kodeskald',
    description: 'AI development assistant with smart model routing, auto-documentation, and autonomous agents. Features a CLI tool and web dashboard for managing multi-provider LLM workflows with 90%+ test coverage.',
    category: 'AI/ML',
    featured: true,
    order: 3,
    technologies: ['Python', 'React', 'TypeScript', 'Claude', 'OpenAI', 'Vite'],
  },
  'skywatch-api': {
    repoName: 'skywatch-api',
    title: 'SkyWatch API',
    description: 'RESTful API serving 80,000+ UFO sighting reports from the NUFORC database. Features pagination, filtering by state/shape/date, full-text search, and 100% test coverage.',
    category: 'Python',
    featured: true,
    order: 4,
    liveUrl: 'https://skywatch-api.vercel.app',
    githubUrl: 'https://github.com/Hustada/skywatch-api',
    technologies: ['Python', 'FastAPI', 'SQLAlchemy', 'Pydantic', 'SQLite', 'pytest'],
  },
  'forge-app': {
    repoName: 'forge-app',
    title: 'Forge',
    description: 'Dark brutalist PWA for tracking 90-day challenge rituals. Offline-first with localStorage persistence, phase-based progression, and custom animations. Designed as a personal discipline tool.',
    category: 'React',
    featured: true,
    order: 5,
    liveUrl: 'https://forge-app-nine.vercel.app',
    githubUrl: 'https://github.com/Hustada/forge-app',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite', 'PWA'],
  },
  'dynastylab': {
    repoName: 'dynastylab',
    title: 'DynastyLab',
    description: 'AI-powered college football dynasty tracker with dynamic content generation. Features AI-written news articles, fan forums with team-specific theming, and local state persistence.',
    category: 'AI/ML',
    featured: true,
    order: 6,
    githubUrl: 'https://github.com/Hustada/dynastylab',
    technologies: ['React', 'TypeScript', 'OpenAI GPT', 'Tailwind CSS', 'Zustand', 'Vite'],
  },
};
