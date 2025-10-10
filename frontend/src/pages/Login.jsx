// import { useState, useEffect } from 'react';
// import { Container, TextField, Button, Box, Typography, Link, Alert, Stack, Paper } from '@mui/material';
// import client from '../api/client';
// // import { logInfo, logError } from '../utils/logger';

// export default function Login() {
//   // useEffect(() => { logInfo('view:login'); }, []);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState('');

//   const handleLogin = async () => {
//     setError('');
//     if (!email || !password) return setError('Email and password are required');
//     try {
//       setBusy(true);
//       const res = await client.post('/auth/login', { email, password });
//       logInfo('auth:login:success', { email });
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('user', JSON.stringify(res.data.user));
//       window.location.href = '/dashboard';
//     } catch (e) {
//       const errorMessage = e.response?.data?.message || 'Login failed';
//       logError('auth:login:fail', { email, error: errorMessage });
//       setError(errorMessage);
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         minHeight: '100vh',
//         bgcolor: 'background.default',
//         px: 2,
//       }}
//     >
//       <Container component={Paper} maxWidth="xs" sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
//         <Typography variant="h4" align="center" gutterBottom color="primary.main" fontWeight="bold">
//           Welcome Back
//         </Typography>
//         <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
//           Sign in to continue
//         </Typography>
//         <Stack spacing={2}>
//           {error && <Alert severity="error">{error}</Alert>}
//           <TextField label="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth />
//           <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} fullWidth />
//           <Button variant="contained" onClick={handleLogin} disabled={busy} size="large" sx={{ py: 1.5 }}>
//             Login
//           </Button>
//           <Typography align="center" sx={{ mt: 2 }}>
//             New here?{' '}
//             <Link href="/signup" underline="hover" color="secondary.main">
//               Create an account
//             </Link>
//           </Typography>
//         </Stack>
//       </Container>
//     </Box>
//   );
// }
// src/pages/Login.jsx (theme-refined, image-polished)


// src/pages/Login.jsx (compact form + richer green-themed background)
import { useState } from 'react';
import {
  Box, Container, TextField, Button, Typography, Link as MuiLink,
  Alert, Stack, Paper, IconButton, InputAdornment, Checkbox,
  FormControlLabel, CircularProgress, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import LockIcon from '@mui/icons-material/Lock';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import client from '../api/client';
import heroImage from '../assets/image1.jpg';

// Theme colors
const T = {
  cream: '#F5F5F0',
  sand:  '#E6D8C3',
  tan:   '#C2A68C',
  green: '#5D866C',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password dialog state
  const [fpOpen, setFpOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState('');
  const [fpBusy, setFpBusy] = useState(false);
  const [fpMsg, setFpMsg] = useState('');
  const [fpErr, setFpErr] = useState('');

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
      setError(e?.response?.data?.message || 'Login failed');
    } finally { setBusy(false); }
  };

  const handleForgot = async () => {
    setFpErr(''); setFpMsg('');
    if (!fpEmail) return setFpErr('Please enter your email');
    try {
      setFpBusy(true);
      await client.post('/auth/forgot-password', { email: fpEmail });
      setFpMsg('If that email exists, a reset link has been sent.');
      setFpEmail('');
    } catch (e) {
      setFpErr(e?.response?.data?.message || 'Something went wrong');
    } finally {
      setFpBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', display: 'grid', placeItems: 'center', bgcolor: T.cream, overflow: 'hidden' }}>
      {/* Background */}
      <Box aria-hidden sx={{ position: 'absolute', inset: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 1600 900" preserveAspectRatio="none">
          <defs>
            <radialGradient id="bg1" cx="0.2" cy="0.2" r="0.8">
              <stop offset="0%" stopColor={T.green} stopOpacity="0.35" />
              <stop offset="100%" stopColor={T.green} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bg2" cx="0.8" cy="0.8" r="0.9">
              <stop offset="0%" stopColor={T.sand} stopOpacity="0.35" />
              <stop offset="100%" stopColor={T.sand} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1600" height="900" fill="url(#bg1)"/>
          <rect width="1600" height="900" fill="url(#bg2)"/>
          <path d="M0,640 C240,600 480,690 760,660 C1040,630 1320,710 1600,680" fill="none" stroke={T.tan} strokeWidth="12" strokeOpacity="0.4" />
          <path d="M0,260 C260,300 520,180 800,240 C1080,300 1340,200 1600,250" fill="none" stroke={T.green} strokeWidth="8" strokeOpacity="0.25" />
          <g opacity=".25" fill={T.green}>
            <circle cx="200" cy="150" r="90" />
            <circle cx="1480" cy="720" r="110" />
          </g>
        </svg>
      </Box>

      {/* Center card */}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '400px 480px' },
          justifyContent: 'center',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 18px 50px rgba(0,0,0,0.15)'
        }}>
          {/* LEFT form */}
          <Paper elevation={0} sx={{
            p: { xs: 2.5, md: 3 },
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: T.green }}>Log in</Typography>
            <Typography sx={{ color: T.tan, mb: 2, fontSize: 14 }}>Welcome back! Please enter your details.</Typography>

            <Stack spacing={1.6}>
              {error && <Alert severity="error" variant="filled">{error}</Alert>}

              <TextField
                size="small"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                InputProps={{ startAdornment: (<InputAdornment position="start"><MailOutlineIcon sx={{ color: T.green }} /></InputAdornment>) }}
              />

              <TextField
                size="small"
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><LockIcon sx={{ color: T.green }} /></InputAdornment>),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw((s) => !s)} edge="end">
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel control={<Checkbox sx={{ color: T.green }} />} label={<Typography sx={{ fontSize: 13 }}>Remember me</Typography>} />
                {/* Open Forgot dialog instead of navigating */}
                <MuiLink component="button" type="button" onClick={() => setFpOpen(true)} underline="hover" sx={{ color: T.green, fontWeight: 700, fontSize: 13 }}>
                  Forgot password?
                </MuiLink>
              </Box>

              <Button
                variant="contained"
                onClick={handleLogin}
                disabled={busy}
                startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <LoginIcon />}
                sx={{
                  py: 1.05,
                  borderRadius: 999,
                  bgcolor: T.green,
                  '&:hover': { bgcolor: '#4b6c57' },
                  fontWeight: 900,
                  letterSpacing: 0.2,
                  boxShadow: '0 10px 22px rgba(93,134,108,.25)'
                }}
              >
                {busy ? 'Signing in…' : 'Log in'}
              </Button>

              {/* Removed social buttons */}
              {/* <Divider>or continue with</Divider>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button fullWidth variant="outlined">Google</Button>
                <Button fullWidth variant="outlined">Facebook</Button>
              </Box> */}

              <Typography align="center" sx={{ color: T.tan, fontSize: 14 }}>
                Don’t have an account?{' '}
                <MuiLink href="/signup" underline="hover" sx={{ color: T.green, fontWeight: 900 }}>Sign up</MuiLink>
              </Typography>
            </Stack>
          </Paper>

          {/* RIGHT image */}
          <Box sx={{ position: 'relative', minHeight: { xs: 220, md: 420 }, overflow: 'hidden' }}>
            <Box component="img" src={heroImage} alt="Welcome" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(93,134,108,0.48) 0%, rgba(93,134,108,0.25) 35%, rgba(93,134,108,0) 70%)' }} />
            <Box sx={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18)', pointerEvents: 'none' }} />
          </Box>
        </Box>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog open={fpOpen} onClose={() => setFpOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Reset your password</DialogTitle>
        <DialogContent dividers>
          {fpMsg && <Alert severity="success" sx={{ mb: 2 }}>{fpMsg}</Alert>}
          {fpErr && <Alert severity="error" sx={{ mb: 2 }}>{fpErr}</Alert>}
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={fpEmail}
            onChange={(e) => setFpEmail(e.target.value)}
            autoFocus
          />
          <Typography variant="body2" sx={{ mt: 1.5, color: T.tan }}>
            We’ll email you a link to set a new password.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFpOpen(false)}>Close</Button>
          <Button onClick={handleForgot} disabled={fpBusy} variant="contained" sx={{ bgcolor: T.green, '&:hover': { bgcolor: '#4b6c57' } }}>
            {fpBusy ? 'Sending…' : 'Send link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
