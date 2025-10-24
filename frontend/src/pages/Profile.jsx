// src/pages/Profile.jsx
import { useEffect, useMemo, useCallback, useState } from 'react';
import {
  Container, Card, CardContent, Typography, Button, Stack,
  AppBar, Toolbar, Box, Chip, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { logEvent } from '../utils/logger'; // ✅ use your existing logger

/* --- Local wrappers so we don't change logger.js --- */
const logInfo  = (message, meta = {}) => logEvent('info',  message, meta);
const logError = (message, meta = {}) => logEvent('error', message, meta);
const withApiLog = async (promise, meta = {}) => {
  const name = meta?.name || 'Unnamed API Call';
  logInfo(`API START → ${name}`, meta);
  try {
    const res = await promise;
    logInfo(`API SUCCESS → ${name}`, { ...meta, status: res?.status });
    return res;
  } catch (err) {
    logError(`API FAIL → ${name}`, {
      ...meta,
      status: err?.response?.status,
      error: err?.response?.data?.message || err?.message,
    });
    throw err;
  }
};

/* ===== Theme (same across app) ===== */
const T = {
  cream: '#F5F5F0',
  sand:  '#E6D8C3',
  tan:   '#C2A68C',
  green: '#5D866C',
  mint:  '#EEF6F2',
  line:  '#D9E4DC',
};

/* Background reused from Login */
const SoftMintBackground = () => (
  <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
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
      <path d="M0,640 C240,600 480,690 760,660 C1040,630 1320,710 1600,680"
            fill="none" stroke={T.tan} strokeWidth="12" strokeOpacity="0.4" />
      <path d="M0,260 C260,300 520,180 800,240 C1080,300 1340,200 1600,250"
            fill="none" stroke={T.green} strokeWidth="8" strokeOpacity="0.25" />
      <g opacity=".25" fill={T.green}>
        <circle cx="200" cy="150" r="90" />
        <circle cx="1480" cy="720" r="110" />
      </g>
    </svg>
  </Box>
);

/* NotesApp Logo */
const NotesAppLogo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#grad)" stroke="#5D866C" strokeWidth="2" />
    <line x1="18" y1="22" x2="46" y2="22" stroke="#5D866C" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="30" x2="46" y2="30" stroke="#5D866C" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="38" x2="46" y2="38" stroke="#5D866C" strokeWidth="2" strokeLinecap="round" />
    <path d="M42 46c-2 2.2-4.5 4.2-8 4.5l-2-.2 5.5-5.5L42 46Z" fill="#5D866C" opacity="0.9" />
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0%" stopColor="#EEF6F2" />
        <stop offset="100%" stopColor="#E6D8C3" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Profile() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  const logout = useCallback(() => {
    // Log before clearing
    logInfo('profile:logout:click', { where: 'navbarButton' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logInfo('profile:logout:done');
    navigate('/login', { replace: true });
  }, [navigate]);

  // Page mount log
  useEffect(() => {
    const meta = {
      hasToken: Boolean(localStorage.getItem('token')),
      hasUser: Boolean(localStorage.getItem('user')),
      email: user?.email || undefined,
      userId: user?._id || user?.id || undefined,
    };
    logInfo('profile:mount', meta);
  }, [user]);

  // verify token
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        logInfo('profile:auth:check:start');
        const res = await withApiLog(client.get('/auth/me'), { name: 'GET /auth/me' });
        if (!alive) return;
        logInfo('profile:auth:check:ok', {
          userId: res?.data?.user?._id || res?.data?.id,
          email:  res?.data?.user?.email || res?.data?.email,
        });
      } catch (e) {
        if (!alive) return;
        logError('profile:auth:check:fail', {
          status: e?.response?.status,
          error: e?.response?.data?.message || e?.message,
        });
        logout();
      }
    })();
    return () => { alive = false; };
  }, [logout]);

  // notes count
  const [noteCount, setNoteCount] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        logInfo('profile:notes:count:start');
        const res = await withApiLog(client.get('/notes'), { name: 'GET /notes' });
        let count = 0;
        if (typeof res?.data?.count === 'number') count = res.data.count;
        else if (Array.isArray(res?.data?.notes)) count = res.data.notes.length;
        if (alive) {
          setNoteCount(count);
          logInfo('profile:notes:count:ok', { count });
        }
      } catch (e) {
        if (alive) {
          setNoteCount(0);
          logError('profile:notes:count:fail', {
            status: e?.response?.status,
            error: e?.response?.data?.message || e?.message,
          });
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: T.cream, overflow: 'hidden' }}>
      <SoftMintBackground />

      {/* Navbar: NotesApp + Dashboard + Logout */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          zIndex: 2,
          color: 'white',
          background: `linear-gradient(135deg, ${T.green} 0%, ${T.tan} 100%)`,
          borderBottom: `1px solid ${T.sand}55`,
        }}
      >
        <Toolbar sx={{ py: 1.1 }}>
          <Box
            onClick={() => {
              logInfo('profile:navigate', { to: '/dashboard', via: 'brand' });
              navigate('/dashboard');
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.3, cursor: 'pointer' }}
          >
            <NotesAppLogo size={34} />
            <Typography
              variant="h5"
              sx={{ fontWeight: 900, letterSpacing: 0.3, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
            >
              NotesApp
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => {
                logInfo('profile:navigate', { to: '/dashboard', via: 'button' });
                navigate('/dashboard');
              }}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.7)',
                '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.12)' },
              }}
            >
              Dashboard
            </Button>
            <Button
              variant="contained"
              onClick={logout}
              sx={{
                bgcolor: '#4b6c57',
                color: '#fff',
                fontWeight: 700,
                '&:hover': { bgcolor: '#3d5948' },
                boxShadow: '0 8px 20px rgba(75,108,87,.3)',
              }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container sx={{ mt: 4, mb: 6, maxWidth: 600, position: 'relative', zIndex: 1 }}>
        <Card
          sx={{
            borderRadius: 4,
            background: `
              linear-gradient(145deg, ${T.mint} 0%, ${T.cream} 100%) padding-box,
              linear-gradient(135deg, ${T.green}33, ${T.tan}22) border-box
            `,
            border: '1px solid transparent',
            boxShadow: '0 25px 60px rgba(93,134,108,0.25)',
            backdropFilter: 'blur(12px)',
            transition: 'transform .3s ease, box-shadow .3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 30px 80px rgba(93,134,108,0.35)',
            },
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={900} color={T.green}>
                User Profile
              </Typography>

              <Stack spacing={0.5}>
                <Typography><strong>Name:</strong> {user?.name || '-'}</Typography>
                <Typography><strong>Email:</strong> {user?.email || '-'}</Typography>
              </Stack>

              {/* Notes count */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography><strong>Total Notes:</strong></Typography>
                {noteCount === null ? (
                  <CircularProgress size={18} sx={{ color: T.green }} />
                ) : (
                  <Chip
                    label={`${noteCount}`}
                    sx={{
                      fontWeight: 800,
                      bgcolor: '#fff',
                      border: `1px solid ${T.line}`,
                      color: T.green,
                    }}
                    onClick={() => logInfo('profile:notes:count:chip:click', { count: noteCount })}
                  />
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
