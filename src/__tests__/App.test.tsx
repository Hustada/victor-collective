import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders without crashing', () => {
  render(<App />);
});

test('renders hero section', () => {
  render(<App />);
  expect(screen.getByText(/View Projects/i)).toBeInTheDocument();
});
