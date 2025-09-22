import { useState } from 'react';
import { Container, TextField, Button, Box, Typography, Link, Alert, Stack } from '@mui/material';
import client from '../api/client';

export default function Login() {
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
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard';
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>Login</Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} fullWidth />
          <Button variant="contained" onClick={handleLogin} disabled={busy}>Login</Button>
          <Typography align="center">
            New here? <Link href="/signup">Create an account</Link>
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
