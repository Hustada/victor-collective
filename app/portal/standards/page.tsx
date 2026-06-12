'use client';

import React from 'react';
import { Container, Box, Typography, Grid, Chip } from '@mui/material';
import { Lightbulb, Code, TextT, ChatCircle, GitBranch, Stack } from '@phosphor-icons/react';
import PortalGate from '../../../src/components/PortalGate';
import DepthCard from '../../../src/components/ui/DepthCard';
import { palette } from '../../../src/theme';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    component="pre"
    sx={{
      backgroundColor: palette.background.base,
      border: `1px solid ${palette.border.subtle}`,
      p: 2,
      mt: 2,
      overflow: 'auto',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.75rem',
      lineHeight: 1.6,
      color: palette.text.secondary,
    }}
  >
    {children}
  </Box>
);

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
    <Box sx={{ color: palette.primary.main, mt: 0.5 }}>{icon}</Box>
    <Box>
      <Typography variant="h5" sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const Principle: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" sx={{ color: palette.primary.light, fontWeight: 600, mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
      {children}
    </Typography>
  </Box>
);

function StandardsContent() {
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
          Standards
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          Code rules, syntax, formatting, and philosophy that govern Victor Collective projects.
          These standards are enforced in every session.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Philosophy */}
        <Grid item xs={12}>
          <DepthCard shadowOffset={6} hoverLift={0} sx={{ height: '100%' }}>
            <Box sx={{ p: 4 }}>
              <SectionHeader
                icon={<Lightbulb size={28} weight="duotone" />}
                title="Philosophy"
                subtitle="First principles that inform every decision"
              />

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Principle title="First Principles">
                    Break every problem down to its smallest parts before building up. Question
                    assumptions. Understand the why before the how.
                  </Principle>

                  <Principle title="Simplicity">
                    Simplest solution that works. No speculative features, no premature abstraction.
                    Complexity is the enemy. Earn every line, every dependency, every abstraction.
                  </Principle>

                  <Principle title="Delete, Don't Deprecate">
                    If something isn&apos;t used, delete it. Don&apos;t deprecate, don&apos;t
                    comment out. Dead code is noise.
                  </Principle>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Principle title="Test-Driven Development">
                    Write tests first, then make them pass. Tests define the contract. If you
                    can&apos;t test it, you don&apos;t understand it.
                  </Principle>

                  <Principle title="Avoid Over-Engineering">
                    Only make changes directly requested or clearly necessary. A bug fix
                    doesn&apos;t need surrounding code cleaned up. Don&apos;t add features, refactor
                    code, or make &quot;improvements&quot; beyond what was asked.
                  </Principle>

                  <Principle title="Professional Objectivity">
                    Technical accuracy over validation. Direct, objective guidance. Respectful
                    correction is more valuable than false agreement.
                  </Principle>
                </Grid>
              </Grid>
            </Box>
          </DepthCard>
        </Grid>

        {/* Tech Stack */}
        <Grid item xs={12} md={6}>
          <DepthCard shadowOffset={6} hoverLift={0} sx={{ height: '100%' }}>
            <Box sx={{ p: 4 }}>
              <SectionHeader
                icon={<Stack size={28} weight="duotone" />}
                title="Tech Stack"
                subtitle="Default technologies for new projects"
              />

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="overline"
                  sx={{ color: palette.text.muted, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                >
                  Primary
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {['TypeScript', 'React', 'Next.js', 'Node.js'].map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      sx={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${palette.primary.main}`,
                        color: palette.primary.light,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.7rem',
                        borderRadius: 0,
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="overline"
                  sx={{ color: palette.text.muted, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                >
                  When Ecosystem Demands
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {['Python', 'FastAPI', 'PyTorch'].map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      sx={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${palette.border.default}`,
                        color: palette.text.secondary,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.7rem',
                        borderRadius: 0,
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: palette.text.muted, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                >
                  Infrastructure
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {['Vercel', 'AWS', 'SQLite', 'PostgreSQL'].map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      sx={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${palette.border.default}`,
                        color: palette.text.secondary,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.7rem',
                        borderRadius: 0,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DepthCard>
        </Grid>

        {/* Code Standards */}
        <Grid item xs={12} md={6}>
          <DepthCard shadowOffset={6} hoverLift={0} sx={{ height: '100%' }}>
            <Box sx={{ p: 4 }}>
              <SectionHeader
                icon={<Code size={28} weight="duotone" />}
                title="Code Standards"
                subtitle="Rules for writing and organizing code"
              />

              <Principle title="Types Everywhere">
                No `any`. No untyped function signatures. Types are documentation that the compiler
                enforces.
              </Principle>

              <Principle title="Small Functions, Single Responsibility">
                If it needs a comment explaining what it does, it&apos;s too complex. Extract until
                the name is the documentation.
              </Principle>

              <Principle title="Errors Are Values">
                Handle errors explicitly at boundaries. No silent failures. No swallowed exceptions.
              </Principle>

              <Principle title="No Backwards-Compatibility Hacks">
                No renaming unused `_vars`, no re-exporting types, no `// removed` comments. If
                it&apos;s unused, delete it completely.
              </Principle>
            </Box>
          </DepthCard>
        </Grid>

        {/* Formatting */}
        <Grid item xs={12} md={6}>
          <DepthCard shadowOffset={6} hoverLift={0} sx={{ height: '100%' }}>
            <Box sx={{ p: 4 }}>
              <SectionHeader
                icon={<TextT size={28} weight="duotone" />}
                title="Formatting &amp; Style"
                subtitle="Enforce with tools, not discipline"
              />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Style is automated. Prettier formats. ESLint catches issues. No debates about tabs
                vs spaces, semicolons, or quote styles.
              </Typography>

              <CodeBlock>
                {`// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}

// Commit format
feat: add user authentication
fix: resolve race condition in queue
refactor: extract validation logic
docs: update API documentation`}
              </CodeBlock>
            </Box>
          </DepthCard>
        </Grid>

        {/* Communication */}
        <Grid item xs={12} md={6}>
          <DepthCard shadowOffset={6} hoverLift={0} sx={{ height: '100%' }}>
            <Box sx={{ p: 4 }}>
              <SectionHeader
                icon={<ChatCircle size={28} weight="duotone" />}
                title="Communication"
                subtitle="How we talk about work"
              />

              <Principle title="Be Direct">
                No filler, no praise, no preamble. Say what needs to be said.
              </Principle>

              <Principle title="Investigate Before Guessing">
                When uncertain, say so. Find the truth first rather than instinctively confirming
                assumptions.
              </Principle>

              <Principle title="Show the Tradeoff">
                Present options with their costs. Let the decision-maker decide.
              </Principle>

              <Principle title="Don't Over-Explain">
                Match the explanation to the audience. Skip what&apos;s already understood.
              </Principle>
            </Box>
          </DepthCard>
        </Grid>

        {/* Workflow */}
        <Grid item xs={12}>
          <DepthCard shadowOffset={6} hoverLift={0} sx={{ height: '100%' }}>
            <Box sx={{ p: 4 }}>
              <SectionHeader
                icon={<GitBranch size={28} weight="duotone" />}
                title="Workflow"
                subtitle="How code moves from idea to production"
              />

              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Principle title="Read Before Writing">
                    Never propose changes to code you haven&apos;t read. Understand existing
                    patterns before suggesting modifications.
                  </Principle>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Principle title="Tests Before Done">
                    Run tests and checks before considering anything complete. Green builds are the
                    baseline, not the goal.
                  </Principle>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Principle title="One Change Per Commit">
                    One logical change per commit. Conventional commit format. Don&apos;t push
                    unless asked.
                  </Principle>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Principle title="Edit Over Create">
                    Prefer editing existing files over creating new ones. Don&apos;t create files
                    unless necessary.
                  </Principle>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Principle title="Security Conscious">
                    Never introduce vulnerabilities: command injection, XSS, SQL injection. If you
                    notice insecure code, fix it immediately.
                  </Principle>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Principle title="No Time Estimates">
                    Never give time predictions. Focus on what needs to be done, not how long it
                    might take. Break work into actionable steps.
                  </Principle>
                </Grid>
              </Grid>
            </Box>
          </DepthCard>
        </Grid>
      </Grid>
    </Container>
  );
}

export default function StandardsPage() {
  return (
    <PortalGate>
      <StandardsContent />
    </PortalGate>
  );
}
