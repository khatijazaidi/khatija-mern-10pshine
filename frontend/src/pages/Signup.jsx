import { useState } from 'react';
import { Container, TextField, Button, Box, Typography, Link, Alert, Stack } from '@mui/material';
import client from '../api/client';

export default function Signup() {
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
      setOk('Account created. Please log in.');
      setTimeout(()=> window.location.href='/login', 600);
    } catch (e) {
      setError(e.response?.data?.message || 'Signup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>Sign Up</Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {ok && <Alert severity="success">{ok}</Alert>}
          <TextField label="Name" value={name} onChange={e=>setName(e.target.value)} fullWidth />
          <TextField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} fullWidth />
          <Button variant="contained" onClick={handleSignup} disabled={busy}>Create account</Button>
          <Typography align="center">
            Already have an account? <Link href="/login">Log in</Link>
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
