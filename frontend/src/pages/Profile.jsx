// src/pages/Profile.jsx
import { useEffect, useMemo, useCallback } from 'react';
import { Container, Card, CardContent, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Navbar from '../components/Navbar';

export default function Profile() {
  const navigate = useNavigate();

  // safely parse user object from localStorage
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  // central logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }, [navigate]);

  // verify token when component mounts
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await client.get('/auth/me');
      } catch {
        if (!alive) return;
        logout();
      }
    })();
    return () => {
      alive = false;
    };
  }, [logout]);

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4, mb: 6, maxWidth: 600 }}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={700}>
                User Profile
              </Typography>

              <Stack spacing={0.5}>
                <Typography>
                  <strong>Name:</strong> {user?.name || '-'}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {user?.email || '-'}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
                <Button variant="outlined" color="error" onClick={logout}>
                  Logout
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
