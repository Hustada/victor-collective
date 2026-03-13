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

export const projectsConfig: Record<string, ProjectConfig> = {};
