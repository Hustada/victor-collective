import { ProjectCategory } from '../services/github';
import { getRandomImage } from '../utils/imageUtils';

export interface ProjectConfig {
  repoName: string;
  title: string;
  description: string;
  image: string;
  category: ProjectCategory;
  liveUrl?: string;
  html_url?: string;
  featured: boolean;
  order?: number;
}

export const projectsConfig: Record<string, ProjectConfig> = {
  'vectus-ai': {
    repoName: 'vectus-ai',
    title: 'Vectus AI - Medical Scheduling Assistant',
    description: 'Intelligent medical scheduling system featuring natural language processing, real-time availability checking, and contextual conversation memory. Built with Node.js, Express, and GPT-4 integration, demonstrating expertise in healthcare AI applications.',
    image: getRandomImage('AI/ML'),
    category: 'AI/ML',
    liveUrl: 'https://vectus-ai.vercel.app',
    featured: true,
    order: 1
  },
  'fallacy-bot': {
    repoName: 'fallacy-bot',
    title: 'Fallacy Bot - AI Logic Analyzer',
    description: 'Sophisticated AI system that detects logical fallacies in text and provides educational feedback. Features advanced GPT integration, interactive dashboard, and comprehensive fallacy detection across multiple categories. Built with Python and Streamlit.',
    image: getRandomImage('AI/ML'),
    category: 'AI/ML',
    html_url: 'https://github.com/Hustada/fallacy-bot',
    featured: true,
    order: 2
  },
  'q-bot': {
    repoName: 'q-bot',
    title: 'Q Bot - AI Content Generation',
    description: 'Creative AI bot that generates and posts Star Trek Q character-themed content on X (Twitter). Demonstrates expertise in AI content generation, automated social media management, and character-based interactions using OpenAI GPT models.',
    image: getRandomImage('AI/ML'),
    category: 'AI/ML',
    html_url: 'https://github.com/Hustada/Q-AI-X-Bot',
    featured: true,
    order: 3
  }
};
