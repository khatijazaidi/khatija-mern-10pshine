// // src/pages/Dashboard.jsx
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Container, Typography, Grid, Button, Box,
//   Alert, Skeleton, IconButton, Tooltip
// } from '@mui/material';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import client from '../api/client';
// import NoteCard from '../components/NoteCard';

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const [notes, setNotes] = useState([]);
//   const [err, setErr] = useState('');
//   const [loading, setLoading] = useState(true);

//   const load = async () => {
//     setErr('');
//     setLoading(true);
//     try {
//       const res = await client.get('/notes');          // <-- hits your backend
//       setNotes(res.data?.notes || []);
//     } catch (e) {
//       setErr(e.response?.data?.message || 'Failed to fetch notes');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   return (
//     <Container sx={{ mt: 4, mb: 6 }}>
//       {/* Top bar */}
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
//         <Typography variant="h4">My Notes</Typography>
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           <Tooltip title="Refresh">
//             <IconButton onClick={load}><RefreshIcon /></IconButton>
//           </Tooltip>
//           <Button variant="contained" onClick={() => navigate('/editor')}>
//             Create Note
//           </Button>
//         </Box>
//       </Box>

//       {/* Error message */}
//       {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

//       {/* Loading skeletons */}
//       {loading && (
//         <Grid container spacing={2}>
//           {[...Array(6)].map((_, i) => (
//             <Grid key={i} item xs={12} sm={6} md={4}>
//               <Skeleton variant="rounded" height={120} />
//             </Grid>
//           ))}
//         </Grid>
//       )}

//       {/* Notes grid */}
//       {!loading && (
//         <>
//           {notes.length ? (
//             <Grid container spacing={2}>
//               {notes.map((n) => (
//                 <Grid key={n._id} item xs={12} sm={6} md={4}>
//                   <NoteCard note={n} onClick={() => navigate(`/editor/${n._id}`)} />
//                 </Grid>
//               ))}
//             </Grid>
//           ) : (
//             <Box sx={{ mt: 6, textAlign: 'center', opacity: 0.8 }}>
//               <Typography>No notes yet.</Typography>
//               <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                 Click “Create Note” to add your first one.
//               </Typography>
//             </Box>
//           )}
//         </>
//       )}
//     </Container>
//   );
// }
// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Paper,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Badge,
  Snackbar,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NoteCard from '../components/NoteCard';
import client from '../api/client';

// Brand palette (matches your request)
const COLORS = {
  primary: '#0A400C', // deep green
  sage: '#819067',
  sand: '#B1AB86',
  cream: '#FEFAE0',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [q, setQ] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('updatedDesc');
  const [refreshed, setRefreshed] = useState(false);

  const openSort = Boolean(anchorEl);

  const load = async () => {
    setErr('');
    setLoading(true);
    try {
      const res = await client.get('/notes'); // backend endpoint
      setNotes(res.data?.notes || []);
      setRefreshed(true);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Derived: filtered + sorted notes (client-side for now)
  const visibleNotes = useMemo(() => {
    const text = q.trim().toLowerCase();
    let list = [...notes];
    if (text) {
      list = list.filter(n =>
        (n.title || '').toLowerCase().includes(text) ||
        (n.content || '').toLowerCase().includes(text)
      );
    }
    list.sort((a, b) => {
      const aU = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bU = new Date(b.updatedAt || b.createdAt || 0).getTime();
      const aC = new Date(a.createdAt || 0).getTime();
      const bC = new Date(b.createdAt || 0).getTime();
      switch (sortBy) {
        case 'titleAsc':
          return (a.title || '').localeCompare(b.title || '');
        case 'titleDesc':
          return (b.title || '').localeCompare(a.title || '');
        case 'createdDesc':
          return bC - aC;
        case 'createdAsc':
          return aC - bC;
        case 'updatedAsc':
          return aU - bU;
        case 'updatedDesc':
        default:
          return bU - aU;
      }
    });
    return list;
  }, [notes, q, sortBy]);

  const totalNotes = notes.length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.cream }}>
      {/* Subtle gradient header */}
      <AppBar position="sticky" elevation={0} sx={{
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.sage} 70%)`,
        color: 'white',
      }}>
        <Toolbar sx={{ py: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>My Notes</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Refresh">
            <IconButton onClick={load} sx={{ color: 'white' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={view === 'grid' ? 'Switch to list view' : 'Switch to grid view'}>
            <IconButton onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')} sx={{ color: 'white' }}>
              {view === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
            </IconButton>
          </Tooltip>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => navigate('/editor')}
            sx={{
              ml: 1,
              bgcolor: COLORS.cream,
              color: COLORS.primary,
              fontWeight: 700,
              '&:hover': { bgcolor: '#FFF8C9' },
            }}
          >
            Create Note
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero / stats + actions */}
      <Container sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(180deg, ${COLORS.cream}, #fff)`,
          border: `1px solid ${COLORS.sand}55`,
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.primary }}>Welcome back 👋</Typography>
              <Typography sx={{ color: COLORS.sand, mt: 0.5 }}>
                Capture ideas, draft essays, or jot quick todos. Use search, sort, and view toggles to find things fast.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<Badge color="success" variant="dot" overlap="circular" sx={{ mr: 0.5 }} />}
                  label={`${totalNotes} total notes`}
                  sx={{ bgcolor: '#ffffffcc', borderColor: COLORS.sand, border: '1px solid', color: COLORS.primary }}
                />
                <Chip
                  icon={<CheckCircleIcon sx={{ color: COLORS.sage }} />}
                  label={visibleNotes.length === totalNotes ? 'All notes shown' : `${visibleNotes.length} shown`}
                  sx={{ bgcolor: '#ffffffcc', borderColor: COLORS.sand, border: '1px solid', color: COLORS.primary }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: { xs: 'stretch', md: 'flex-end' }, width: '100%' }}>
                <TextField
                  fullWidth
                  placeholder="Search notes…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: COLORS.sage }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    maxWidth: 420,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      borderRadius: 2,
                      '& fieldset': { borderColor: `${COLORS.sand}88` },
                      '&:hover fieldset': { borderColor: COLORS.sage },
                      '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                    },
                  }}
                />
                <Tooltip title="Sort">
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ bgcolor: 'white', border: `1px solid ${COLORS.sand}55` }}>
                    <SortIcon sx={{ color: COLORS.primary }} />
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={anchorEl} open={openSort} onClose={() => setAnchorEl(null)}>
                  <MenuItem selected={sortBy === 'updatedDesc'} onClick={() => { setSortBy('updatedDesc'); setAnchorEl(null); }}>Recently updated</MenuItem>
                  <MenuItem selected={sortBy === 'updatedAsc'} onClick={() => { setSortBy('updatedAsc'); setAnchorEl(null); }}>Oldest updated</MenuItem>
                  <Divider />
                  <MenuItem selected={sortBy === 'createdDesc'} onClick={() => { setSortBy('createdDesc'); setAnchorEl(null); }}>Newest created</MenuItem>
                  <MenuItem selected={sortBy === 'createdAsc'} onClick={() => { setSortBy('createdAsc'); setAnchorEl(null); }}>Oldest created</MenuItem>
                  <Divider />
                  <MenuItem selected={sortBy === 'titleAsc'} onClick={() => { setSortBy('titleAsc'); setAnchorEl(null); }}>Title A → Z</MenuItem>
                  <MenuItem selected={sortBy === 'titleDesc'} onClick={() => { setSortBy('titleDesc'); setAnchorEl(null); }}>Title Z → A</MenuItem>
                </Menu>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Error message */}
        {err && (
          <Alert severity="error" icon={<ErrorOutlineIcon />} sx={{ my: 2, borderRadius: 2 }}>
            {err}
          </Alert>
        )}

        {/* Loading skeletons */}
        {loading && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {[...Array(8)].map((_, i) => (
              <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                <Skeleton
                  variant="rounded"
                  height={160}
                  sx={{
                    borderRadius: 3,
                    bgcolor: '#ffffffa8',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Notes area */}
        {!loading && (
          visibleNotes.length ? (
            view === 'grid' ? (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {visibleNotes.map((n) => (
                  <Grid key={n._id} item xs={12} sm={6} md={4} lg={3}>
                    <NoteCard
                      note={n}
                      onClick={() => navigate(`/editor/${n._id}`)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 160ms ease, box-shadow 160ms ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(10,64,12,0.15)'
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {visibleNotes.map((n) => (
                  <Paper
                    key={n._id}
                    onClick={() => navigate(`/editor/${n._id}`)}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      border: `1px solid ${COLORS.sand}55`,
                      cursor: 'pointer',
                      backgroundColor: '#fff',
                      transition: 'background 160ms ease, transform 160ms ease',
                      '&:hover': { background: '#fffef4', transform: 'translateY(-1px)' }
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.primary }}>{n.title || 'Untitled'}</Typography>
                      <Typography variant="body2" sx={{ color: COLORS.sand, mt: 0.5 }} noWrap>
                        {(n.content || '').replace(/<[^>]+>/g, '') || '—'}
                      </Typography>
                    </Box>
                    <Chip size="small" label={new Date(n.updatedAt || n.createdAt).toLocaleString()} sx={{ bgcolor: COLORS.cream }} />
                  </Paper>
                ))}
              </Box>
            )
          ) : (
            <EmptyState onCreate={() => navigate('/editor')} />
          )
        )}

        <Box sx={{ height: 96 }} />
      </Container>

      {/* Floating create button for mobile */}
      <Tooltip title="Create note">
        <IconButton
          onClick={() => navigate('/editor')}
          size="large"
          sx={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            bgcolor: COLORS.primary,
            color: 'white',
            boxShadow: '0 10px 24px rgba(10,64,12,0.25)',
            '&:hover': { bgcolor: '#0C4A0E' },
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      {/* Tiny confirmation after refresh */}
      <Snackbar
        open={refreshed}
        autoHideDuration={1400}
        onClose={() => setRefreshed(false)}
        message="Notes refreshed"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: { bgcolor: COLORS.primary } }}
      />
    </Box>
  );
}

function EmptyState({ onCreate }) {
  return (
    <Paper elevation={0} sx={{
      mt: 6,
      p: 5,
      borderRadius: 4,
      textAlign: 'center',
      background: `radial-gradient(1200px 400px at 50% -20%, ${COLORS.sage}11, transparent 60%), #fff`,
      border: `1px dashed ${COLORS.sand}66`,
    }}>
      <Box sx={{
        width: 120,
        height: 120,
        borderRadius: '24px',
        mx: 'auto',
        mb: 2,
        background:
          `conic-gradient(from 180deg, ${COLORS.sage}22, ${COLORS.primary}11 40%, ${COLORS.sand}22 70%, ${COLORS.cream}aa)`,
        border: `1px solid ${COLORS.sand}55`,
        display: 'grid',
        placeItems: 'center',
      }}>
        <GridViewIcon sx={{ fontSize: 48, color: COLORS.sage }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.primary }}>No notes yet</Typography>
      <Typography sx={{ color: COLORS.sand, mt: 0.5 }}>Click below to create your first note.</Typography>
      <Button onClick={onCreate} startIcon={<AddIcon />} variant="contained" sx={{
        mt: 2.5,
        bgcolor: COLORS.primary,
        '&:hover': { bgcolor: '#0C4A0E' },
      }}>
        Create Note
      </Button>
    </Paper>
  );
}
