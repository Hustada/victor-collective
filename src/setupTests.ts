import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';

// react-router v7 needs TextEncoder/TextDecoder in jsdom
Object.assign(global, { TextEncoder, TextDecoder });

// Mock IntersectionObserver for framer-motion's whileInView
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [0];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as any;
