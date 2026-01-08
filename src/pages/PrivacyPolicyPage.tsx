import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  Database,
  Eye,
  Link as LinkIcon,
  Clock,
  UserCircle,
  Baby,
  Bell,
  EnvelopeSimple,
} from '@phosphor-icons/react';
import { alpha } from '@mui/material/styles';
import { getPrivacyPolicy } from '../config/privacyConfig';
import { palette } from '../theme';
import GridPattern from '../components/effects/GridPattern';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  index: number;
}

const Section: React.FC<SectionProps> = ({ icon, title, children, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Box
      sx={{
        mb: 6,
        p: 4,
        background: palette.background.elevated,
        border: `1px solid ${palette.border.subtle}`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: palette.primary.main,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ color: palette.primary.main }}>{icon}</Box>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            color: palette.text.primary,
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  </motion.div>
);

const PrivacyPolicyPage: React.FC = () => {
  const { appName } = useParams<{ appName: string }>();
  const navigate = useNavigate();
  const policy = appName ? getPrivacyPolicy(appName) : undefined;

  if (!policy) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          pt: 16,
          pb: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.background.base,
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ color: palette.text.primary, mb: 2 }}>
            Policy Not Found
          </Typography>
          <Typography variant="body1" sx={{ color: palette.text.secondary, mb: 4 }}>
            The privacy policy you're looking for doesn't exist.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/privacy')}
            startIcon={<ArrowLeft size={20} />}
          >
            Back to Privacy Hub
          </Button>
        </Container>
      </Box>
    );
  }

  const { sections } = policy;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 16,
        pb: 12,
        position: 'relative',
        backgroundColor: palette.background.base,
      }}
    >
      <GridPattern opacity={0.03} fadeDirection="bottom" />

      <Container maxWidth="md">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            onClick={() => navigate('/privacy')}
            startIcon={<ArrowLeft size={20} />}
            sx={{
              mb: 4,
              color: palette.text.secondary,
              '&:hover': {
                color: palette.primary.main,
              },
            }}
          >
            All Privacy Policies
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <ShieldCheck size={40} color={palette.primary.main} weight="duotone" />
              <Typography
                variant="h1"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  color: palette.text.primary,
                }}
              >
                {policy.appName} Privacy Policy
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 4,
                flexWrap: 'wrap',
                mt: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: palette.text.muted,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.8rem',
                }}
              >
                Effective: {policy.effectiveDate}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: palette.text.muted,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.8rem',
                }}
              >
                Last Updated: {policy.lastUpdated}
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Overview */}
        <Section icon={<Eye size={24} weight="bold" />} title="Overview" index={0}>
          <Typography
            variant="body1"
            sx={{ color: palette.text.secondary, lineHeight: 1.8 }}
          >
            {sections.overview}
          </Typography>
        </Section>

        {/* Data Collected */}
        <Section
          icon={<Database size={24} weight="bold" />}
          title={sections.dataCollected.title}
          index={1}
        >
          {sections.dataCollected.items.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                mb: idx < sections.dataCollected.items.length - 1 ? 3 : 0,
                pb: idx < sections.dataCollected.items.length - 1 ? 3 : 0,
                borderBottom:
                  idx < sections.dataCollected.items.length - 1
                    ? `1px solid ${palette.border.subtle}`
                    : 'none',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 600,
                  color: palette.text.primary,
                  mb: 1,
                }}
              >
                {item.type}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: palette.text.secondary, mb: 0.5 }}
              >
                {item.description}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: palette.primary.light,
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                Purpose: {item.purpose}
              </Typography>
            </Box>
          ))}
        </Section>

        {/* Data Usage */}
        <Section
          icon={<Eye size={24} weight="bold" />}
          title="How We Use Your Data"
          index={2}
        >
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {sections.dataUsage.map((usage, idx) => (
              <Typography
                key={idx}
                component="li"
                variant="body2"
                sx={{ color: palette.text.secondary, mb: 1, lineHeight: 1.6 }}
              >
                {usage}
              </Typography>
            ))}
          </Box>
        </Section>

        {/* Third Party Services */}
        <Section
          icon={<LinkIcon size={24} weight="bold" />}
          title="Third-Party Services"
          index={3}
        >
          <Typography
            variant="body2"
            sx={{ color: palette.text.secondary, mb: 3 }}
          >
            We use the following third-party services that may collect information:
          </Typography>
          {sections.thirdPartyServices.map((service, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2,
                borderBottom:
                  idx < sections.thirdPartyServices.length - 1
                    ? `1px solid ${palette.border.subtle}`
                    : 'none',
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    color: palette.text.primary,
                  }}
                >
                  {service.name}
                </Typography>
                <Typography variant="caption" sx={{ color: palette.text.muted }}>
                  {service.purpose}
                </Typography>
              </Box>
              {service.privacyUrl && (
                <Box
                  component="a"
                  href={service.privacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: palette.primary.main,
                    fontSize: '0.75rem',
                    fontFamily: '"JetBrains Mono", monospace',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Privacy Policy →
                </Box>
              )}
            </Box>
          ))}
        </Section>

        {/* Data Retention */}
        <Section
          icon={<Clock size={24} weight="bold" />}
          title="Data Retention"
          index={4}
        >
          <Typography
            variant="body1"
            sx={{ color: palette.text.secondary, lineHeight: 1.8 }}
          >
            {sections.dataRetention}
          </Typography>
        </Section>

        {/* User Rights */}
        <Section
          icon={<UserCircle size={24} weight="bold" />}
          title="Your Rights"
          index={5}
        >
          <Typography
            variant="body2"
            sx={{ color: palette.text.secondary, mb: 2 }}
          >
            You have the right to:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {sections.userRights.map((right, idx) => (
              <Typography
                key={idx}
                component="li"
                variant="body2"
                sx={{ color: palette.text.secondary, mb: 1 }}
              >
                {right}
              </Typography>
            ))}
          </Box>
        </Section>

        {/* Children's Privacy */}
        <Section
          icon={<Baby size={24} weight="bold" />}
          title="Children's Privacy"
          index={6}
        >
          <Typography
            variant="body1"
            sx={{ color: palette.text.secondary, lineHeight: 1.8 }}
          >
            {sections.childrenPrivacy}
          </Typography>
        </Section>

        {/* Changes */}
        <Section
          icon={<Bell size={24} weight="bold" />}
          title="Changes to This Policy"
          index={7}
        >
          <Typography
            variant="body1"
            sx={{ color: palette.text.secondary, lineHeight: 1.8 }}
          >
            {sections.changes}
          </Typography>
        </Section>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Box
            sx={{
              mt: 4,
              p: 4,
              background: alpha(palette.primary.main, 0.1),
              border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
              textAlign: 'center',
            }}
          >
            <EnvelopeSimple
              size={32}
              color={palette.primary.main}
              weight="duotone"
              style={{ marginBottom: 16 }}
            />
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                color: palette.text.primary,
                mb: 1,
              }}
            >
              Questions or Concerns?
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: palette.text.secondary, mb: 2 }}
            >
              If you have any questions about this Privacy Policy, please contact us:
            </Typography>
            <Box
              component="a"
              href={`mailto:${policy.contactEmail}`}
              sx={{
                color: palette.primary.main,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '1rem',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {policy.contactEmail}
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PrivacyPolicyPage;
