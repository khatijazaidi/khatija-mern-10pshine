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

import { useState, useEffect } from 'react';

import {
  Box, Container, TextField, Button, Typography, Link as MuiLink,
  Alert, Stack, Paper, IconButton, InputAdornment, Checkbox,
  FormControlLabel, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, LinearProgress, Chip, Divider, Tooltip
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import LockIcon from '@mui/icons-material/Lock';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockResetIcon from '@mui/icons-material/LockReset';
import client from '../api/client';
import heroImage from '../assets/image1.jpg';
import { logEvent } from '../utils/logger';


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

  // Forgot Password dialog state (direct reset)
  const [fpOpen, setFpOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState('');
  const [fpNewPw, setFpNewPw] = useState('');
  const [fpNewPw2, setFpNewPw2] = useState('');
  const [fpShow1, setFpShow1] = useState(false);
  const [fpShow2, setFpShow2] = useState(false);
  const [fpBusy, setFpBusy] = useState(false);
  const [fpMsg, setFpMsg] = useState('');
  const [fpErr, setFpErr] = useState('');

    useEffect(() => { 
    logEvent('info', 'view:login'); 
  }, []);

  // password strength helper
  const pwScore = (s) => {
    let score = 0;
    if (!s) return 0;
    if (s.length >= 6) score += 30;
    if (/[A-Z]/.test(s)) score += 20;
    if (/[0-9]/.test(s)) score += 25;
    if (/[^A-Za-z0-9]/.test(s)) score += 25;
    return Math.min(score, 100);
  };
  const score = pwScore(fpNewPw);
  const strengthLabel = score < 40 ? 'Weak' : score < 75 ? 'Good' : 'Strong';

  const handleLogin = async () => {
    setError('');
    if (!email || !password) return setError('Email and password are required');
    try {
      setBusy(true);
      await logEvent('info', 'auth:login:attempt', { email });
      const res = await client.post('/auth/login', { email, password });
       await logEvent('info', 'auth:login:success', { email, userId: res?.data?.user?._id });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard';
    } catch (e) {
      await logEvent('error', 'auth:login:fail', { email, error: e?.response?.data?.message || e.message });

      setError(e?.response?.data?.message || 'Login failed');
    } finally { setBusy(false); }
  };

  // Direct reset: call /auth/forgot-password { email, newPassword }
  const handleForgot = async () => {
    setFpErr(''); setFpMsg('');
    if (!fpEmail) return setFpErr('Please enter your email');
    if (!fpNewPw) return setFpErr('Please enter a new password');
    if (fpNewPw.length < 6) return setFpErr('New password must be at least 6 characters');
    if (fpNewPw !== fpNewPw2) return setFpErr('Passwords do not match');
    try {
      setFpBusy(true);
      await logEvent('info', 'auth:forgot:attempt', { email: fpEmail });

      await client.post('/auth/forgot-password', { email: fpEmail, newPassword: fpNewPw });
      await logEvent('info', 'auth:forgot:success', { email: fpEmail });

      setFpMsg('Password updated successfully. You can log in with your new password now.');
      setFpEmail(''); setFpNewPw(''); setFpNewPw2('');
    } catch (e) {
      await logEvent('error', 'auth:forgot:fail', { email: fpEmail, error: e?.response?.data?.message || e.message });

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
          <rect width="1600" height="900" fill="url(#bg1)" />
          <rect width="1600" height="900" fill="url(#bg2)" />
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
               <MuiLink
  component="button"
  type="button"
  onClick={() => { 
    setFpOpen(true); 
    logEvent('info', 'auth:forgot:open'); 
  }}
  underline="hover"
  sx={{ color: T.green, fontWeight: 700, fontSize: 13 }}
>
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
      <Dialog
        open={fpOpen}
        onClose={() => setFpOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            overflow: 'hidden',
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${T.sand}`,
            boxShadow: '0 18px 50px rgba(0,0,0,0.18)'
          }
        }}
      >
        {/* Gradient Header */}
        <Box
          sx={{
            px: 2.5, py: 2,
            display: 'flex', alignItems: 'center', gap: 1.5,
            background: `linear-gradient(135deg, ${T.green} 0%, ${T.tan} 100%)`,
            color: '#fff'
          }}
        >
          <Box
            sx={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'grid', placeItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.22)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)'
            }}
          >
            <LockResetIcon />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 900, lineHeight: 1 }}>Reset your password</Typography>
            {/* <Typography sx={{ opacity: 0.9, fontSize: 12 }}>
        
            </Typography> */}
          </Box>
        </Box>

        <DialogContent sx={{ p: 2.5 }} dividers>
          {fpMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{fpMsg}</Alert>}
          {fpErr && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{fpErr}</Alert>}

          <Stack spacing={1.6}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              autoFocus
              size="small"
              InputProps={{
                startAdornment: (<InputAdornment position="start"><MailOutlineIcon sx={{ color: T.green }} /></InputAdornment>)
              }}
            />

            <Divider sx={{ my: 0.5, borderColor: T.sand, opacity: 0.5 }} />

            <TextField
              label="New password"
              type={fpShow1 ? 'text' : 'password'}
              fullWidth
              value={fpNewPw}
              onChange={(e) => setFpNewPw(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (<InputAdornment position="start"><LockIcon sx={{ color: T.green }} /></InputAdornment>),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setFpShow1((s) => !s)} edge="end">
                      {fpShow1 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              helperText="Minimum 6 characters"
            />

            {/* Strength bar */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: T.tan }}>Password strength</Typography>
                <Typography variant="caption" sx={{ color: score < 40 ? '#b00020' : score < 75 ? '#b37b00' : T.green, fontWeight: 700 }}>
                  {strengthLabel}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                  height: 8, borderRadius: 999,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: score < 40 ? '#b00020' : score < 75 ? '#b37b00' : T.green
                  },
                  backgroundColor: T.cream
                }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip size="small" label="6+ chars" color={fpNewPw.length >= 6 ? 'success' : 'default'} variant={fpNewPw.length >= 6 ? 'filled' : 'outlined'} />
                <Chip size="small" label="A–Z" color={/[A-Z]/.test(fpNewPw) ? 'success' : 'default'} variant={/[A-Z]/.test(fpNewPw) ? 'filled' : 'outlined'} />
                <Chip size="small" label="0–9" color={/[0-9]/.test(fpNewPw) ? 'success' : 'default'} variant={/[0-9]/.test(fpNewPw) ? 'filled' : 'outlined'} />
                <Chip size="small" label="symbol" color={/[^A-Za-z0-9]/.test(fpNewPw) ? 'success' : 'default'} variant={/[^A-Za-z0-9]/.test(fpNewPw) ? 'filled' : 'outlined'} />
              </Stack>
            </Box>

            <TextField
              label="Confirm new password"
              type={fpShow2 ? 'text' : 'password'}
              fullWidth
              value={fpNewPw2}
              onChange={(e) => setFpNewPw2(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (<InputAdornment position="start"><LockIcon sx={{ color: T.green }} /></InputAdornment>),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setFpShow2((s) => !s)} edge="end">
                      {fpShow2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Typography variant="body2" sx={{ color: T.tan }}>
              Enter your account email and a new password.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 2, gap: 1.25, background: 'linear-gradient(180deg, rgba(198,182,160,0.08), rgba(198,182,160,0))' }}>
          <Button onClick={() => setFpOpen(false)} sx={{ color: T.green, fontWeight: 700 }}>
            Close
          </Button>
          <Tooltip title={fpBusy ? '' : 'Save new password'}>
            <span>
              <Button
                onClick={handleForgot}
                disabled={fpBusy}
                variant="contained"
                startIcon={fpBusy ? <CircularProgress size={16} color="inherit" /> : <LockResetIcon />}
                sx={{
                  bgcolor: T.green,
                  '&:hover': { bgcolor: '#4b6c57' },
                  borderRadius: 999,
                  px: 2.2, py: 1.1,
                  boxShadow: '0 10px 22px rgba(93,134,108,.25)',
                  fontWeight: 900,
                  letterSpacing: 0.2
                }}
              >
                {fpBusy ? 'Updating…' : 'Reset password'}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </Box>
  );
}