// src/pages/Editor.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, TextField, Button, Box, Stack, Alert, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, AppBar, Toolbar, Typography,
  IconButton, Tooltip, Paper, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import client from '../api/client';
import RichEditor from '../components/RichEditor';
import { logEvent } from '../utils/logger';

/* ===== Theme (same as Dashboard/Login) ===== */
const T = {
  cream: '#F5F5F0',
  sand:  '#E6D8C3',
  tan:   '#C2A68C',
  green: '#5D866C',
  mint:  '#EEF6F2',
  mint2: '#F3F8F5',
  line:  '#D9E4DC',
};

/* Soft background reused from Login */
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

/* NotesApp Logo (same as Dashboard) */
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

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  useEffect(() => {
  logEvent('info', 'view:editor', { mode: id ? 'edit' : 'create', id });
}, [id]);


  const isNew = !id;
  const [status, setStatus] = useState(isNew ? 'Writing a new note' : 'Editing note');
  const idleTimer = useRef(null);
  const savedTimer = useRef(null);
  const titleLogTimer = useRef(null);
  const contentLogTimer = useRef(null);

  // Load existing note
  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      setErr(''); setLoading(true);
      try {
        await logEvent('info', 'note:load:attempt', { id });
        const res = await client.get(`/notes/${id}`);
        if (!alive) return;
        setTitle(res.data.note?.title || '');
        setContent(res.data.note?.content || '');
        setStatus('Editing note');
        await logEvent('info', 'note:load:success', { id });       // 🟢 add
      } catch (e) {
        setErr(e?.response?.data?.message || 'Failed to load note');
        setErr(msg);
        await logEvent('error', 'note:load:fail', { id, error: msg });
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // Typing status
  const bumpTyping = (baseLabel) => {
    setStatus('Typing…');
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setStatus(baseLabel), 900);
  };
  const onTitleChange = (e) => {
    setTitle(e.target.value);
    bumpTyping(isNew ? 'Writing a new note' : 'Editing note');
     if (titleLogTimer.current) clearTimeout(titleLogTimer.current);
  titleLogTimer.current = setTimeout(() => {
    logEvent('info', 'note:change:title', { id, length: e.target.value.length });
  }, 400);
  };
  const onContentChange = (val) => {
    setContent(val);
    bumpTyping(isNew ? 'Writing a new note' : 'Editing note');
      if (contentLogTimer.current) clearTimeout(contentLogTimer.current);
  contentLogTimer.current = setTimeout(() => {
    // rough plain-text length (strip tags)
    const plain = (val || '').replace(/<[^>]+>/g, '');
    logEvent('info', 'note:change:content', { id, length: plain.length });
  }, 500);
  };

  const handleSave = async () => {
    setErr('');
    if (!title.trim() && !content.trim()) {
      setErr('Please write a title or content before saving');
      return;
    }
    try {
      setSaving(true);
          await logEvent('info', 'note:save:attempt', {
      id,
      mode: id ? 'edit' : 'create',
      titleLen: title.trim().length
    });
      
      if (id) {
        await client.put(`/notes/${id}`, { title, content });
      } else {
        await client.post('/notes', { title, content });
      }
      setStatus('Saved');
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(
        () => setStatus(isNew ? 'Writing a new note' : 'Editing note'),
        1200
      );
      await logEvent('info', 'note:save:success', {
      id,
      mode: id ? 'edit' : 'create'
    });
      navigate('/dashboard');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Save failed');
      await logEvent('error', 'note:save:fail', {
      id,
      mode: id ? 'edit' : 'create',
      error: msg
    });
    setErr(msg);

    } finally {
      setSaving(false);
    }
  };

const handleCancel = () => {
  logEvent('info', 'nav:editor->dashboard', { reason: 'cancel' });
  navigate('/dashboard');
};

  const handleDelete = async () => {
    try {
      setSaving(true);
      await logEvent('info', 'note:delete:attempt', { id });
      await client.delete(`/notes/${id}`);
      await logEvent('info', 'note:delete:success', { id });
      navigate('/dashboard');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Delete failed');
      await logEvent('error', 'note:delete:fail', { id, error: msg });
      setErr(msg);
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  useEffect(() => {
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      if (titleLogTimer.current) clearTimeout(titleLogTimer.current);
      if (contentLogTimer.current) clearTimeout(contentLogTimer.current);
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'grid', placeItems: 'center',
        bgcolor: T.cream, overflow: 'hidden'
      }}>
        <SoftMintBackground />
        <CircularProgress sx={{ color: T.green, zIndex: 1 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        bgcolor: T.cream,
        overflow: 'hidden'
      }}
    >
      {/* Background from Login */}
      <SoftMintBackground />

      {/* SINGLE NAVBAR like Dashboard */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          zIndex: 2,
          color: 'white',
          background: `linear-gradient(135deg, ${T.green} 0%, ${T.tan} 100%)`,
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${T.sand}55`,
        }}
      >
        <Toolbar sx={{ py: 1.1 }}>
          <Box
            onClick={() => navigate('/dashboard')}
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

          <Tooltip title="Back to Dashboard">
            <IconButton onClick={() => {
      logEvent('info', 'nav:editor->dashboard', { action: 'back' });
      navigate('/dashboard');
    }}
    sx={{ color: 'white' }}
    >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          {/* Profile avatar (same as Dashboard) */}
          <Tooltip title="Profile">
            <IconButton
              onClick={() => {
      logEvent('info', 'nav:editor->profile');
      navigate('/profile');
    }}
              sx={{
                ml: 1.8,
                width: 46, height: 46, borderRadius: '50%',
                background: `linear-gradient(145deg, rgba(255,255,255,0.28), rgba(255,255,255,0.16))`,
                border: `2px solid rgba(255,255,255,0.55)`,
                boxShadow: '0 6px 18px rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 10px 28px rgba(255,255,255,0.25)',
                  background: `linear-gradient(145deg, rgba(255,255,255,0.35), rgba(255,255,255,0.18))`,
                },
              }}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
                alt="profile"
                style={{ width: 26, height: 26, filter: 'invert(1) brightness(1.2)' }}
              />
            </IconButton>
          </Tooltip>
<Button
  onClick={() => {
    logEvent('info', 'user:logout');
    localStorage.clear();
    navigate('/login');
  }}
  variant="contained"
  sx={{
    ml: 2,
    px: 3,
    py: 1,
    borderRadius: 999,
    textTransform: 'none',
    fontWeight: 700,
    fontSize: 15,
    bgcolor: '#ffffff',
    color: T.green,
    boxShadow: '0 10px 22px rgba(0,0,0,0.16)',
    '&:hover': {
      bgcolor: '#fff4',
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 28px rgba(0,0,0,0.24)',
    },
  }}
>
  Logout
</Button>

        </Toolbar>
      </AppBar>

      {/* CONTENT */}
      <Container sx={{ mt: 4, mb: 6, position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            background: `
              linear-gradient(180deg, rgba(255,255,255,.88), rgba(255,255,255,.74)) padding-box,
              linear-gradient(135deg, ${T.mint}, ${T.line}) border-box
            `,
            border: '1px solid transparent',
            boxShadow: '0 18px 50px rgba(0,0,0,0.10)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Stack spacing={2}>
            {err && <Alert severity="error">{err}</Alert>}

            {/* Status chip */}
            <Chip
              size="small"
              label={status}
              sx={{
                alignSelf: 'flex-start',
                bgcolor: '#fff',
                border: `1px solid ${T.line}`,
                color: T.green,
                fontWeight: 700,
              }}
            />

            {/* Title */}
            <TextField
              label="Title"
              value={title}
              onChange={onTitleChange}
              inputProps={{ maxLength: 120 }}
              fullWidth
              InputProps={{ sx: { fontSize: 24, fontWeight: 800, color: T.green, borderRadius: 3, bgcolor: '#fff' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: T.line },
                  '&:hover fieldset': { borderColor: T.tan },
                  '&.Mui-focused fieldset': { borderColor: T.green },
                },
              }}
            />

            <RichEditor value={content} onChange={onContentChange} />

            {/* Actions (unchanged positions) */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  bgcolor: T.green,
                  '&:hover': { bgcolor: '#4b6c57' },
                  boxShadow: '0 10px 22px rgba(93,134,108,.22)',
                }}
              >
                {saving ? 'Saving…' : 'Save Note'}
              </Button>

              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  borderColor: T.green,
                  color: T.green,
                  '&:hover': { borderColor: '#4b6c57', color: '#4b6c57', backgroundColor: '#fff' },
                }}
              >
                Cancel
              </Button>

              {!!id && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                     onClick={() => {
      logEvent('info', 'note:delete:open', { id });
      setConfirmOpen(true);
    }}
                  disabled={saving}
                  sx={{ ml: 'auto', borderRadius: 999, px: 3 }}
                >
                  Delete
                </Button>
              )}
            </Box>

            {/* Delete confirmation dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
              <DialogTitle>Delete this note?</DialogTitle>
              <DialogContent>This action cannot be undone.</DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button color="error" onClick={handleDelete}>Delete</Button>
              </DialogActions>
            </Dialog>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
