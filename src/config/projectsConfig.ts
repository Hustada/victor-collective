import project1 from '../assets/brand/project1.jpg';
import project2 from '../assets/brand/project2.jpg';
import project3 from '../assets/brand/project3.jpg';

export interface ProjectConfig {
  repoName: string;
  title: string;
  description: string;
  image: string;
  category: 'AI/ML' | 'React' | 'Full Stack' | 'Python';
  liveUrl?: string;
  featured: boolean;
  order?: number;
}

export const projectsConfig: Record<string, ProjectConfig> = {
  'metacraft': {
    repoName: 'metacraft',
    title: 'MetaCraft AI',
    description: 'An intelligent web content analyzer using GPT-4 and Claude 3 for instant summaries, insights, and structured data extraction. Features modern React UI and real-time analysis.',
    image: project1,
    category: 'AI/ML',
    liveUrl: 'https://metacraft-beta.vercel.app',
    featured: true,
    order: 1
  },
  'ai-showcase': {
    repoName: 'ai-showcase',
    title: 'The Victor Collective',
    description: 'A modern portfolio built with React, TypeScript, and Material-UI, featuring dynamic animations and EmailJS integration for seamless contact functionality.',
    image: project2,
    category: 'React',
    liveUrl: 'https://ai-showcase-one.vercel.app',
    featured: true,
    order: 2
  },
  'fleet-dashboard': {
    repoName: 'fleet-dashboard',
    title: 'Fleet Dashboard',
    description: 'Modern fleet management dashboard with responsive UI, built with React and Material-UI. Features real-time tracking and analytics.',
    image: project3,
    category: 'Full Stack',
    liveUrl: 'https://fleet-dashboard-demo.vercel.app',
    featured: true,
    order: 3
  }
};
