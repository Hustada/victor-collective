import React from 'react';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Blog from './components/Blog';
import Newsletter from './components/Newsletter';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
        <ThemeToggle />
        <Navbar />
        <Hero />
        <About />
        <Projects />
        <Blog />
        <Newsletter />
        <Contact />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
