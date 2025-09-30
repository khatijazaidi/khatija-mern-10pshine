import { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, Typography, Link, Alert, Stack, Paper } from '@mui/material';
import client from '../api/client';
import { logInfo, logError } from '../utils/logger';

export default function Signup() {
  useEffect(() => { logInfo('view:signup'); }, []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const handleSignup = async () => {
    setError(''); setOk('');
    if (!name || !email || !password) return setError('All fields are required');
    try {
      setBusy(true);
      await client.post('/auth/register', { name, email, password });
      logInfo('auth:signup:success', { name, email });
      setOk('Account created. Please log in.');
      setTimeout(()=> window.location.href='/login', 600);
    } catch (e) {
      const errorMessage = e.response?.data?.message || 'Signup failed';
      logError('auth:signup:fail', { name, email, error: errorMessage });
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
          Create Your Account
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Get started with a new account
        </Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {ok && <Alert severity="success">{ok}</Alert>}
          <TextField label="Full Name" value={name} onChange={e=>setName(e.target.value)} fullWidth />
          <TextField label="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} fullWidth />
          <Button variant="contained" onClick={handleSignup} disabled={busy} size="large" sx={{ py: 1.5 }}>
            Create Account
          </Button>
          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link href="/login" underline="hover" color="secondary.main">
              Log in
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
