import AIApp1 from '../assets/brand/AIApp1.jpg';
import AIApp2 from '../assets/brand/AIApp2.jpg';
import AIApp3 from '../assets/brand/AIApp3.jpg';
import AIApp4 from '../assets/brand/AIApp4.jpg';
import WebApp1 from '../assets/brand/WebApp1.jpg';
import WebApp2 from '../assets/brand/WebApp2.jpg';
import WebApp3 from '../assets/brand/WebApp3.jpg';
import GeneralApp1 from '../assets/brand/GeneralApp1.jpg';
import GeneralApp2 from '../assets/brand/GeneralApp2.jpg';
import GeneralApp3 from '../assets/brand/GeneralApp3.jpg';

import { ProjectCategory } from '../services/github';

// Image collections by category
export const categoryImages = {
  'AI/ML': [AIApp1, AIApp2, AIApp3, AIApp4],
  'React': [WebApp1, WebApp2, WebApp3],
  'Full Stack': [GeneralApp1, GeneralApp2, GeneralApp3],
  'Python': [GeneralApp1, GeneralApp2, GeneralApp3],
} as const;

// Function to get random image for category
export const getRandomImage = (category: ProjectCategory): string => {
  const images = categoryImages[category];
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};
