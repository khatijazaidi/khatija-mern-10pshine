// import { useState, useEffect } from 'react';
// import { Container, TextField, Button, Box, Typography, Link, Alert, Stack, Paper } from '@mui/material';
// import client from '../api/client';
// // import { logInfo, logError } from '../utils/logger';

// export default function Signup() {
//   useEffect(() => { logInfo('view:signup'); }, []);
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState('');
//   const [ok, setOk] = useState('');

//   const handleSignup = async () => {
//     setError(''); setOk('');
//     if (!name || !email || !password) return setError('All fields are required');
//     try {
//       setBusy(true);
//       await client.post('/auth/register', { name, email, password });
//       logInfo('auth:signup:success', { name, email });
//       setOk('Account created. Please log in.');
//       setTimeout(()=> window.location.href='/login', 600);
//     } catch (e) {
//       const errorMessage = e.response?.data?.message || 'Signup failed';
//       logError('auth:signup:fail', { name, email, error: errorMessage });
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
//           Create Your Account
//         </Typography>
//         <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
//           Get started with a new account
//         </Typography>
//         <Stack spacing={2}>
//           {error && <Alert severity="error">{error}</Alert>}
//           {ok && <Alert severity="success">{ok}</Alert>}
//           <TextField label="Full Name" value={name} onChange={e=>setName(e.target.value)} fullWidth />
//           <TextField label="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth />
//           <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} fullWidth />
//           <Button variant="contained" onClick={handleSignup} disabled={busy} size="large" sx={{ py: 1.5 }}>
//             Create Account
//           </Button>
//           <Typography align="center" sx={{ mt: 2 }}>
//             Already have an account?{' '}
//             <Link href="/login" underline="hover" color="secondary.main">
//               Log in
//             </Link>
//           </Typography>
//         </Stack>
//       </Container>
//     </Box>
//   );
// }
// src/pages/Signup.jsx

import { useState, useEffect } from 'react';
import { logEvent } from '../utils/logger';
import {
  Box, Container, TextField, Button, Typography, Link as MuiLink,
  Alert, Stack, Paper, InputAdornment, IconButton, CircularProgress, Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import client from '../api/client';
import heroImage from '../assets/image1.jpg';




// Theme
const T = {
  cream: '#F5F5F0',
  sand: '#E6D8C3',
  tan: '#C2A68C',
  green: '#5D866C',
};

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

    useEffect(() => {
    logEvent('info', 'view:signup');
  }, []);
  const handleSignup = async () => {
    setError(''); setOk('');
    if (!name || !email || !password) return setError('All fields are required');
    try {
      setBusy(true);
      await logEvent('info', 'auth:signup:attempt', { name, email });

      await client.post('/auth/register', { name, email, password });
      await logEvent('info', 'auth:signup:success', { name, email });

      setOk('Account created. Please log in.');
      setTimeout(() => window.location.href = '/login', 600);
    } catch (e) {
      const errorMessage = e?.response?.data?.message || 'Signup failed';
      await logEvent('error', 'auth:signup:fail', { name, email, error: errorMessage });

      setError(errorMessage);
    } finally { setBusy(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', display: 'grid', placeItems: 'center', bgcolor: T.cream, overflow: 'hidden' }}>
      {/* background accents */}
      <Box aria-hidden sx={{ position: 'absolute', inset: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 1600 900" preserveAspectRatio="none">
          <defs>
            <radialGradient id="sg1" cx="0.2" cy="0.2" r="0.8">
              <stop offset="0%" stopColor={T.green} stopOpacity="0.3" />
              <stop offset="100%" stopColor={T.green} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1600" height="900" fill="url(#sg1)" />
          <path d="M0,640 C240,600 480,690 760,660 C1040,630 1320,710 1600,680" fill="none" stroke={T.tan} strokeWidth="12" strokeOpacity="0.4" />
          <g opacity=".25" fill={T.sand}>
            <circle cx="200" cy="160" r="90" />
            <circle cx="1480" cy="720" r="110" />
          </g>
        </svg>
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '400px 480px' },
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 18px 50px rgba(0,0,0,0.15)'
        }}>
          {/* LEFT – signup form */}
          <Paper elevation={0} sx={{
            p: { xs: 3, md: 4 },
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: T.green }}>Create Account</Typography>
            <Typography sx={{ color: T.tan, mb: 2, fontSize: 14 }}>Get started with your new account</Typography>

            <Stack spacing={1.8}>
              {error && <Alert severity="error" variant="filled">{error}</Alert>}
              {ok && <Alert severity="success" variant="filled">{ok}</Alert>}

              <TextField
                size="small"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon sx={{ color: T.green }} /></InputAdornment>) }}
              />

              <TextField
                size="small"
                label="Email Address"
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
                      <IconButton onClick={() => setShowPw(s => !s)} edge="end">
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                variant="contained"
                onClick={handleSignup}
                disabled={busy}
                startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{
                  py: 1.2,
                  borderRadius: 999,
                  bgcolor: T.green,
                  '&:hover': { bgcolor: '#4b6c57' },
                  fontWeight: 900,
                  letterSpacing: 0.2,
                }}
              >
                {busy ? 'Creating…' : 'Sign up'}
              </Button>

              <Divider>Already have an account?</Divider>
              <Typography align="center" sx={{ color: T.tan, fontSize: 14 }}>
                <MuiLink href="/login" underline="hover" sx={{ color: T.green, fontWeight: 900 }}>
                  Log in
                </MuiLink>
              </Typography>
            </Stack>
          </Paper>

          {/* RIGHT – image panel */}
          <Box sx={{ position: 'relative', minHeight: { xs: 220, md: 420 }, overflow: 'hidden' }}>
            <Box component="img" src={heroImage} alt="Signup Hero" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(93,134,108,0.48) 0%, rgba(93,134,108,0.25) 35%, rgba(93,134,108,0) 70%)' }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
