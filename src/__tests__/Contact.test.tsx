import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import theme from '../theme';
import Contact from '../components/Contact';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>{ui}</BrowserRouter>
    </ThemeProvider>
  );
}

test('renders contact form', () => {
  renderWithProviders(<Contact />);
  expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
});

test('renders submit button', () => {
  renderWithProviders(<Contact />);
  expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
});

test('renders contact links', () => {
  renderWithProviders(<Contact />);
  expect(screen.getByText('@hustada')).toBeInTheDocument();
});
