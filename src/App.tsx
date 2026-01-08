import React from 'react';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

// Pages
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogTagPage from './pages/BlogTagPage';
import PrivacyHubPage from './pages/PrivacyHubPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

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
          <CursorGlow />
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/blog/tag/:tag" element={<BlogTagPage />} />
            <Route path="/privacy" element={<PrivacyHubPage />} />
            <Route path="/privacy/:appName" element={<PrivacyPolicyPage />} />
          </Routes>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
