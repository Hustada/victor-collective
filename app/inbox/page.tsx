'use client';

import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { Envelope } from '@phosphor-icons/react';
import PortalGate from '../../src/components/PortalGate';
import { palette } from '../../src/theme';

function InboxContent() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="overline"
          color="primary"
          sx={{ letterSpacing: 2, display: 'block', mb: 1 }}
        >
          Portal
        </Typography>
        <Typography variant="h3" component="h1" gutterBottom>
          Inbox
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Email inbox integration coming soon.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 12,
          opacity: 0.5,
        }}
      >
        <Envelope size={80} color={palette.text.secondary} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          IMAP Integration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect to your email server
        </Typography>
      </Box>
    </Container>
  );
}

export default function InboxPage() {
  return (
    <PortalGate>
      <InboxContent />
    </PortalGate>
  );
}
