'use client';

import React from 'react';
import { Container, Box, Typography, Grid, Button } from '@mui/material';
import { Envelope, FileText, BookOpen } from '@phosphor-icons/react';
import Link from 'next/link';
import PortalGate from '../../src/components/PortalGate';
import DepthCard from '../../src/components/ui/DepthCard';
import { palette } from '../../src/theme';

function PortalContent() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="overline"
          color="primary"
          sx={{ letterSpacing: 2, display: 'block', mb: 1 }}
        >
          Dashboard
        </Typography>
        <Typography variant="h3" component="h1" gutterBottom>
          Portal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Internal tools and workspace for The Victor Collective.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DepthCard shadowOffset={8} hoverLift={6}>
            <Box sx={{ p: 4 }}>
              <Envelope size={48} color={palette.primary.main} style={{ marginBottom: 16 }} />
              <Typography variant="h5" gutterBottom>
                Inbox
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Email inbox integration for managing communications.
              </Typography>
              <Button component={Link} href="/inbox" variant="outlined" sx={{ mt: 1 }}>
                Open Inbox
              </Button>
            </Box>
          </DepthCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DepthCard shadowOffset={8} hoverLift={6}>
            <Box sx={{ p: 4 }}>
              <FileText size={48} color={palette.primary.main} style={{ marginBottom: 16 }} />
              <Typography variant="h5" gutterBottom>
                Invoices
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create and manage invoices for clients.
              </Typography>
              <Button component={Link} href="/invoices" variant="outlined" sx={{ mt: 1 }}>
                Manage Invoices
              </Button>
            </Box>
          </DepthCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DepthCard shadowOffset={8} hoverLift={6}>
            <Box sx={{ p: 4 }}>
              <BookOpen size={48} color={palette.primary.main} style={{ marginBottom: 16 }} />
              <Typography variant="h5" gutterBottom>
                Standards
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Code rules, philosophy, and workflow standards.
              </Typography>
              <Button component={Link} href="/portal/standards" variant="outlined" sx={{ mt: 1 }}>
                View Standards
              </Button>
            </Box>
          </DepthCard>
        </Grid>
      </Grid>
    </Container>
  );
}

export default function PortalPage() {
  return (
    <PortalGate>
      <PortalContent />
    </PortalGate>
  );
}
