import { ProjectCategory } from '../services/github';
import { getRandomImage } from '../utils/imageUtils';

export interface ProjectConfig {
  repoName: string;
  title: string;
  description: string;
  image: string;
  category: ProjectCategory;
  topics?: string[];
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
    image: getRandomImage('Full Stack'),
    category: 'Full Stack',
    topics: ['nodejs', 'express', 'gpt-4', 'nlp', 'ai', 'typescript', 'react'],
    liveUrl: 'https://vectus-ai-hustadas-projects.vercel.app/',
    featured: true,
    order: 1
  },
  'fallacy-bot': {
    repoName: 'fallacy-bot',
    title: 'Fallacy Bot - AI Logic Analyzer',
    description: 'Sophisticated AI system that detects logical fallacies in text and provides educational feedback. Features advanced GPT integration, interactive dashboard, and comprehensive fallacy detection across multiple categories. Built with Python and Streamlit.',
    image: getRandomImage('Python'),
    category: 'Python',
    topics: ['python', 'streamlit', 'gpt-3.5', 'nlp', 'ai', 'sqlite', 'machine-learning'],
    liveUrl: 'https://fallacy-bot-f2yogzwbkm8g7njxxfasz4.streamlit.app',
    html_url: 'https://github.com/Hustada/fallacy-bot',
    featured: true,
    order: 2
  },
  'q-bot': {
    repoName: 'q-bot',
    title: 'Q Bot - AI Content Generation',
    description: 'Creative AI bot that generates and posts Star Trek Q character-themed content on X (Twitter). Demonstrates expertise in AI content generation, automated social media management, and character-based interactions using OpenAI GPT models.',
    image: getRandomImage('Python'),
    category: 'Python',
    topics: ['python', 'openai', 'twitter-api', 'automation', 'nlp', 'ai', 'content-generation'],
    html_url: 'https://github.com/Hustada/Q-AI-X-Bot',
    featured: true,
    order: 3
  }
};
