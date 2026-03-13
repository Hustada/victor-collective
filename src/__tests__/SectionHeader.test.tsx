import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import SectionHeader from '../components/ui/SectionHeader';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

test('renders section number and title', () => {
  renderWithTheme(<SectionHeader number="01" title="About" />);
  expect(screen.getByText('// 01')).toBeInTheDocument();
  expect(screen.getByText('About')).toBeInTheDocument();
});

test('renders subtitle when provided', () => {
  renderWithTheme(<SectionHeader number="02" title="Projects" subtitle="My work" />);
  expect(screen.getByText('My work')).toBeInTheDocument();
});

test('does not render subtitle when omitted', () => {
  renderWithTheme(<SectionHeader number="03" title="Blog" />);
  expect(screen.queryByText('My work')).not.toBeInTheDocument();
});
