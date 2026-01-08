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
  'ai-photo-tools-demo': {
    repoName: 'ai-photo-tools-demo',
    title: 'AI Photo Tools - Intelligent Image Processing',
    description: 'Full-stack AI application for intelligent photo manipulation and enhancement. Features AI-powered image processing, real-time transformations, and seamless user experience. Built with TypeScript, React, and advanced vision models, demonstrating production-ready AI product engineering.',
    image: getRandomImage('AI/ML'),
    category: 'AI/ML',
    topics: ['typescript', 'react', 'ai', 'computer-vision', 'image-processing', 'vercel', 'nextjs'],
    liveUrl: 'https://ai-photo-tools-theta.vercel.app',
    html_url: 'https://github.com/hustada/ai-photo-tools-demo',
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
    title: 'Q Bot - Autonomous AI Content Agent',
    description: 'Autonomous AI agent that generates and publishes Star Trek Q character content on X platform. Features self-directed content creation, personality modeling, and automated social media engagement. Demonstrates advanced agent autonomy, creative AI generation, and production deployment of conversational agents using OpenAI GPT models.',
    image: getRandomImage('Python'),
    category: 'Python',
    topics: ['python', 'openai', 'autonomous-agents', 'twitter-api', 'nlp', 'ai-agents', 'content-generation', 'gpt'],
    html_url: 'https://github.com/Hustada/Q-AI-X-Bot',
    featured: true,
    order: 3
  }
};
