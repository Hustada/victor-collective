'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import { palette } from '../theme';

const LINKS = [
  { href: '/portal', label: 'Portal' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/clients', label: 'Clients' },
  { href: '/inbox', label: 'Inbox' },
  { href: '/portal/standards', label: 'Standards' },
];

// Exact match for the portal home, prefix match for sections (so /portal/standards
// highlights Standards, not Portal).
function isActive(pathname: string, href: string): boolean {
  return href === '/portal' ? pathname === '/portal' : pathname.startsWith(href);
}

const PortalNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <Box
      component="nav"
      sx={{
        display: 'flex',
        gap: { xs: 2.5, sm: 4 },
        alignItems: 'center',
        px: { xs: 2, sm: 4 },
        py: 1.5,
        borderBottom: `1px solid ${palette.border.subtle}`,
        backgroundColor: palette.background.elevated,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        overflowX: 'auto',
      }}
    >
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Box
            key={link.href}
            component={Link}
            href={link.href}
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: active ? palette.primary.light : palette.text.secondary,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s',
              '&:hover': { color: palette.primary.light },
            }}
          >
            {link.label}
          </Box>
        );
      })}
    </Box>
  );
};

export default PortalNav;
