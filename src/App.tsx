import React, { Suspense, useEffect } from 'react';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import theme from './theme';

// Font imports
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Blog from './components/Blog';
import Newsletter from './components/Newsletter';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CursorGlow from './components/effects/CursorGlow';

// Pages (lazy-loaded)
import BlogPage from './pages/BlogPage';

const BlogPostPage = React.lazy(() => import('./pages/BlogPostPage'));
const BlogTagPage = React.lazy(() => import('./pages/BlogTagPage'));
const PrivacyHubPage = React.lazy(() => import('./pages/PrivacyHubPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Blog />
      <Newsletter />
      <Contact />
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            backgroundColor: 'background.default',
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <ScrollToTop />
          <CursorGlow />
          <Navbar />
          <Suspense
            fallback={
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '50vh',
                }}
              >
                <CircularProgress />
              </Box>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/blog/tag/:tag" element={<BlogTagPage />} />
              <Route path="/privacy" element={<PrivacyHubPage />} />
              <Route path="/privacy/:appName" element={<PrivacyPolicyPage />} />
            </Routes>
          </Suspense>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
