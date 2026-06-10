'use client';

import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';
import { Lock, LockOpen } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { palette } from '../theme';
import PortalNav from './PortalNav';

interface PortalGateProps {
  children: React.ReactNode;
}

// Ember particle component
const EmberParticle: React.FC<{ delay: number; index: number }> = ({ delay, index }) => {
  // More organic, varied movement
  const baseAngle = (index / 50) * Math.PI * 2;
  const angleVariation = (Math.random() - 0.5) * 0.8;
  const angle = baseAngle + angleVariation;
  const distance = 80 + Math.random() * 180;
  const size = 2 + Math.random() * 6;
  const floatUp = -30 - Math.random() * 80; // Embers float upward

  return (
    <motion.div
      initial={{
        x: 0,
        y: 0,
        scale: 0,
        opacity: 0,
      }}
      animate={{
        x: [
          0,
          Math.cos(angle) * distance * 0.3,
          Math.cos(angle) * distance * 0.7,
          Math.cos(angle) * distance,
        ],
        y: [
          0,
          floatUp * 0.3,
          floatUp * 0.6 + Math.sin(angle) * distance * 0.3,
          floatUp + Math.sin(angle) * distance * 0.5,
        ],
        scale: [0, 1.2, 1, 0],
        opacity: [0, 1, 0.6, 0],
      }}
      transition={{
        duration: 2,
        delay,
        ease: 'easeOut',
        times: [0, 0.2, 0.6, 1],
      }}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, #fff 0%, ${palette.primary.light} 30%, ${palette.primary.main} 70%, transparent 100%)`,
        boxShadow: `0 0 ${size * 3}px ${palette.primary.main}, 0 0 ${size * 6}px ${palette.primary.main}44`,
        pointerEvents: 'none',
      }}
    />
  );
};

// Text reveal after lock burns
const AccessGranted: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}
    >
      {/* THE VICTOR COLLECTIVE text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      >
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: palette.text.primary,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            The{' '}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            style={{ color: palette.primary.main }}
          >
            Victor
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.1 }}
          >
            {' '}
            Collective
          </motion.span>
        </Typography>
      </motion.div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 1.5, ease: 'easeOut' }}
        style={{
          width: 120,
          height: 2,
          backgroundColor: palette.primary.main,
          transformOrigin: 'center',
        }}
      />

      {/* ACCESS GRANTED */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 2 }}
      >
        <Typography
          variant="overline"
          sx={{
            color: palette.primary.main,
            letterSpacing: '0.3em',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.7rem',
          }}
        >
          {'// ACCESS GRANTED'}
        </Typography>
      </motion.div>

      {/* Shockwave */}
      <motion.div
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 20, opacity: 0 }}
        transition={{ duration: 1.5, delay: 2.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: `1px solid ${palette.primary.main}`,
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
};

// Main unlock animation
const UnlockAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'burning' | 'reveal' | 'complete'>('burning');
  const particles = Array.from({ length: 50 }, (_, i) => i);

  useEffect(() => {
    // Longer pause before transitioning to reveal
    const timer1 = setTimeout(() => setPhase('reveal'), 1400);
    return () => clearTimeout(timer1);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.background.base,
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 400,
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Lock icon that burns away */}
        <AnimatePresence>
          {phase === 'burning' && (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{
                scale: [1, 1.15, 1.1, 0.9],
                opacity: [1, 1, 0.7, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.div
                animate={{
                  filter: [
                    'blur(0px) brightness(1)',
                    'blur(0px) brightness(1.3)',
                    'blur(4px) brightness(1.5)',
                    'blur(8px) brightness(2)',
                  ],
                }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              >
                <LockOpen
                  size={70}
                  weight="duotone"
                  color={palette.primary.main}
                  style={{
                    filter: `drop-shadow(0 0 30px ${palette.primary.main})`,
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ember particles - staggered burst */}
        {phase === 'burning' &&
          particles.map((i) => <EmberParticle key={i} delay={0.3 + i * 0.025} index={i} />)}

        {/* Reveal phase - The Victor Collective */}
        <AnimatePresence>
          {phase === 'reveal' && <AccessGranted onComplete={onComplete} />}
        </AnimatePresence>

        {/* Ambient glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0.2] }}
          transition={{ duration: 3, times: [0, 0.3, 1] }}
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${palette.primary.main}22 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />
      </Box>
    </Box>
  );
};

const PortalGate: React.FC<PortalGateProps> = ({ children }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Ask the server whether the session cookie is still valid
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => setAuthenticated(res.ok))
      .catch(() => setAuthenticated(false))
      .finally(() => setIsHydrated(true));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: input }),
      });
      if (res.ok) {
        setShowAnimation(true);
      } else {
        setError(res.status === 401 ? 'Wrong password' : 'Login unavailable');
        setInput('');
      }
    } catch {
      setError('Login unavailable');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnimationComplete = () => {
    setAnimationComplete(true);
    setTimeout(() => {
      setAuthenticated(true);
    }, 300);
  };

  // Show loading state until hydrated
  if (!isHydrated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.background.base,
        }}
      />
    );
  }

  // Already authenticated - skip animation
  if (authenticated)
    return (
      <>
        <PortalNav />
        {children}
      </>
    );

  // Show unlock animation
  if (showAnimation && !animationComplete) {
    return <UnlockAnimation onComplete={handleAnimationComplete} />;
  }

  // Fade in content after animation
  if (animationComplete) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <PortalNav />
        {children}
      </motion.div>
    );
  }

  // Login form
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.background.base,
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              p: 4,
              border: `1px solid ${palette.border.subtle}`,
              backgroundColor: palette.background.elevated,
            }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 0px ${palette.primary.main}`,
                  `0 0 20px ${palette.primary.main}`,
                  `0 0 0px ${palette.primary.main}`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ borderRadius: '50%', padding: 8 }}
            >
              <Lock size={40} weight="duotone" color={palette.primary.main} />
            </motion.div>

            <Typography
              variant="overline"
              sx={{
                color: palette.text.muted,
                letterSpacing: '0.2em',
              }}
            >
              {'// RESTRICTED'}
            </Typography>

            <TextField
              fullWidth
              type="password"
              placeholder="Password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              error={error !== null}
              helperText={error ?? ''}
              autoFocus
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              sx={{ py: 1.5 }}
            >
              Enter
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PortalGate;
