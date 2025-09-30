import { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, Typography, Link, Alert, Stack, Paper } from '@mui/material';
import client from '../api/client';
import { logInfo, logError } from '../utils/logger';

export default function Login() {
  useEffect(() => { logInfo('view:login'); }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) return setError('Email and password are required');
    try {
      setBusy(true);
      const res = await client.post('/auth/login', { email, password });
      logInfo('auth:login:success', { email });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard';
    } catch (e) {
      const errorMessage = e.response?.data?.message || 'Login failed';
      logError('auth:login:fail', { email, error: errorMessage });
      setError(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Container component={Paper} maxWidth="xs" sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary.main" fontWeight="bold">
          Welcome Back
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Sign in to continue
        </Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} fullWidth />
          <Button variant="contained" onClick={handleLogin} disabled={busy} size="large" sx={{ py: 1.5 }}>
            Login
          </Button>
          <Typography align="center" sx={{ mt: 2 }}>
            New here?{' '}
            <Link href="/signup" underline="hover" color="secondary.main">
              Create an account
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
