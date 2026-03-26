import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';
import { Lock } from '@phosphor-icons/react';
import { palette } from '../theme';

const PORTAL_PASSWORD = process.env.REACT_APP_PORTAL_PASSWORD || 'letmein';

interface PortalGateProps {
  children: React.ReactNode;
}

const PortalGate: React.FC<PortalGateProps> = ({ children }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('portal_auth') === 'true'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PORTAL_PASSWORD) {
      sessionStorage.setItem('portal_auth', 'true');
      setAuthenticated(true);
    } else {
      setError(true);
      setInput('');
    }
  };

  if (authenticated) return <>{children}</>;

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
          <Lock size={40} weight="duotone" color={palette.primary.main} />

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
              setError(false);
            }}
            error={error}
            helperText={error ? 'Wrong password' : ''}
            autoFocus
          />

          <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5 }}>
            Enter
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PortalGate;
