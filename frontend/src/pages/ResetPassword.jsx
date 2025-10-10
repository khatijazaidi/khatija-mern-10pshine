import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert, Stack } from '@mui/material';
import client from '../api/client';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setOk(''); setErr('');
    if (!password || password.length < 6) return setErr('Password must be at least 6 characters');
    if (password !== confirm) return setErr('Passwords do not match');
    if (!token) return setErr('Missing token');

    try {
      setBusy(true);
      await client.post('/auth/reset-password', { token, password });
      setOk('Password updated. Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Invalid or expired link');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: '#F5F5F0' }}>
      <Paper sx={{ p: 3, width: 380 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Set a new password</Typography>
          {ok && <Alert severity="success">{ok}</Alert>}
          {err && <Alert severity="error">{err}</Alert>}
          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            fullWidth
          />
          <Button onClick={handleSubmit} disabled={busy} variant="contained">
            {busy ? 'Updating…' : 'Update Password'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
