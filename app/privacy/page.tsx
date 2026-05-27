import { Metadata } from 'next';
import { Container, Box, Typography } from '@mui/material';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for The Victor Collective website and services.',
};

export default function PrivacyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 16 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="overline"
          color="primary"
          sx={{ letterSpacing: 2, display: 'block', mb: 1 }}
        >
          Legal
        </Typography>
        <Typography variant="h3" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: May 2025
        </Typography>
      </Box>

      <Box sx={{ '& h2': { mt: 4, mb: 2 }, '& p': { mb: 2, lineHeight: 1.8 } }}>
        <Typography variant="h5" component="h2">
          Information We Collect
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We collect information you provide directly, such as when you use our contact form or
          subscribe to our newsletter. This may include your name and email address.
        </Typography>

        <Typography variant="h5" component="h2">
          How We Use Your Information
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We use the information we collect to respond to your inquiries, send newsletters
          you&apos;ve subscribed to, and improve our services.
        </Typography>

        <Typography variant="h5" component="h2">
          Data Security
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We implement appropriate security measures to protect your personal information. However,
          no method of transmission over the Internet is 100% secure.
        </Typography>

        <Typography variant="h5" component="h2">
          Third-Party Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We may use third-party services such as EmailJS for form submissions and GitHub for
          project information. These services have their own privacy policies.
        </Typography>

        <Typography variant="h5" component="h2">
          Contact
        </Typography>
        <Typography variant="body1" color="text.secondary">
          If you have questions about this privacy policy, please contact us through the contact
          form on our website.
        </Typography>
      </Box>
    </Container>
  );
}
