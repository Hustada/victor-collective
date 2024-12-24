import React from 'react';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Blog from './components/Blog';
import Newsletter from './components/Newsletter';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogTagPage from './pages/BlogTagPage';

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
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
          <ThemeToggle />
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/blog/tag/:tag" element={<BlogTagPage />} />
          </Routes>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
