import React from 'react';
import { Typography, Box, Link } from '@mui/material';
import { palette } from '../theme';

interface ContactLinkProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}

const ContactLink: React.FC<ContactLinkProps> = ({ icon, label, value, href }) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      py: 2,
      px: 3,
      textDecoration: 'none',
      border: `1px solid ${palette.border.subtle}`,
      background: palette.background.elevated,
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: palette.primary.main,
        transform: 'translateX(8px)',
        '& .contact-icon': {
          color: palette.primary.main,
        },
      },
    }}
  >
    <Box
      className="contact-icon"
      sx={{
        color: palette.text.secondary,
        transition: 'color 0.2s',
        display: 'flex',
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: palette.text.muted,
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          display: 'block',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: palette.text.primary,
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Link>
);

export default ContactLink;
