import type { Metadata } from 'next';
import { Box } from '@mui/material';
import ThemeRegistry from './ThemeRegistry';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CursorGlow from '@/components/effects/CursorGlow';
import CommandPalette from '@/components/CommandPalette';

export const metadata: Metadata = {
  metadataBase: new URL('https://victorcollective.com'),
  title: {
    default: 'The Victor Collective | AI Systems That Compound',
    template: '%s | The Victor Collective',
  },
  description:
    'Building autonomous systems that compound — agents, pipelines, infrastructure that runs without babysitting.',
  keywords: [
    'AI consulting',
    'autonomous agents',
    'AI systems',
    'machine learning',
    'software engineering',
  ],
  authors: [{ name: 'Viktor Ash' }],
  creator: 'Viktor Ash',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://victorcollective.com',
    siteName: 'The Victor Collective',
    title: 'The Victor Collective | AI Systems That Compound',
    description:
      'Building autonomous systems that compound — agents, pipelines, infrastructure that runs without babysitting.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Victor Collective',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Victor Collective | AI Systems That Compound',
    description:
      'Building autonomous systems that compound — agents, pipelines, infrastructure that runs without babysitting.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Box
            sx={{
              backgroundColor: 'background.default',
              minHeight: '100vh',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CursorGlow />
            <CommandPalette />
            <Navbar />
            {children}
            <Footer />
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
