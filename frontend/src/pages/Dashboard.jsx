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
import UpdateIcon from '@mui/icons-material/Update';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import NoteCard from '../components/NoteCard';
import client from '../api/client';
import { keyframes } from '@mui/system';


/* ===== Theme (balanced, no pinks) ===== */
const T = {
  cream: '#F5F5F0',
  sand: '#E6D8C3',
  tan: '#C2A68C',
  green: '#5D866C',
  mint: '#EEF6F2',  // light mint
  mint2: '#F3F8F5', // lighter mint for panels
  line: '#D9E4DC',  // soft border
};

/* ===== Animations ===== */
const pop = keyframes`
  0% { transform: scale(.98); opacity: 0 }
  100% { transform: scale(1); opacity: 1 }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
`;

// slow drifting background blobs
const drift = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(1) }
  50%  { transform: translate3d(3%, -2%, 0) scale(1.04) }
  100% { transform: translate3d(0, 0, 0) scale(1) }
`;

export default function Dashboard() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(() => localStorage.getItem('dash:view') || 'grid');
  const [q, setQ] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('dash:sort') || 'updatedDesc');
  const [refreshed, setRefreshed] = useState(false);
  const openSort = Boolean(anchorEl);

  const load = async () => {
    setErr('');
    setLoading(true);
    try {
      const res = await client.get('/notes');
      setNotes(res.data?.notes || []);
      setRefreshed(true);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  // === Custom NotesApp Logo (matches mint–sand–green theme) ===
const NotesAppLogo = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Rounded background shape */}
    <rect
      x="2"
      y="2"
      width="60"
      height="60"
      rx="14"
      fill="url(#grad)"
      stroke="#5D866C"
      strokeWidth="2"
    />

    {/* Notebook page lines */}
    <line x1="18" y1="22" x2="46" y2="22" stroke="#5D866C" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="30" x2="46" y2="30" stroke="#5D866C" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="38" x2="46" y2="38" stroke="#5D866C" strokeWidth="2" strokeLinecap="round" />

    {/* Spark pen mark */}
    <path
      d="M42 46c-2 2.2-4.5 4.2-8 4.5l-2-.2 5.5-5.5L42 46Z"
      fill="#5D866C"
      opacity="0.9"
    />

    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0%" stopColor="#EEF6F2" />
        <stop offset="100%" stopColor="#E6D8C3" />
      </linearGradient>
    </defs>
  </svg>
);


  useEffect(() => { load(); }, []);
  useEffect(() => { localStorage.setItem('dash:view', view); }, [view]);
  useEffect(() => { localStorage.setItem('dash:sort', sortBy); }, [sortBy]);

  // filter + sort
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
        case 'titleAsc':   return (a.title || '').localeCompare(b.title || '');
        case 'titleDesc':  return (b.title || '').localeCompare(a.title || '');
        case 'createdDesc':return bC - aC;
        case 'createdAsc': return aC - bC;
        case 'updatedAsc': return aU - bU;
        case 'updatedDesc':
        default:           return bU - aU;
      }
    });

    return list;
  }, [notes, q, sortBy]);

  const totalNotes = notes.length;

  /* ===== Hero Video ===== */
  const HERO = {
    poster: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1800&auto=format&fit=crop',
    src: 'https://cdn.coverr.co/videos/coverr-sunbeams-through-leaves-6694/1080p.mp4'
  };

  const SortItem = ({ id, icon, label }) => (
    <MenuItem
      selected={sortBy === id}
      onClick={() => { setSortBy(id); setAnchorEl(null); }}
      sx={{ gap: 1 }}
    >
      {icon}{label}
    </MenuItem>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${T.mint2}, ${T.cream})`,
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Interactive floating mint washes */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <Box sx={{
          position: 'absolute',
          width: 700, height: 700, top: -200, left: -120,
          background: `radial-gradient(50% 50% at 50% 50%, ${T.mint}AA 0%, transparent 70%)`,
          filter: 'blur(10px)',
          animation: `${drift} 22s ease-in-out infinite`,
        }} />
        <Box sx={{
          position: 'absolute',
          width: 650, height: 650, bottom: -220, right: -100,
          background: `radial-gradient(50% 50% at 50% 50%, ${T.sand}88 0%, transparent 70%)`,
          filter: 'blur(12px)',
          animation: `${drift} 26s ease-in-out infinite reverse`,
        }} />
      </Box>

      {/* Top Bar */}
      {/* App Bar */}
<AppBar
  position="sticky"
  elevation={0}
  sx={{
    color: 'white',
    background: `linear-gradient(135deg, ${T.green} 0%, ${T.tan} 100%)`,
    backdropFilter: 'blur(8px)',
    borderBottom: `1px solid ${T.sand}55`,
  }}
>
  <Toolbar sx={{ py: 1.1 }}>
    {/* Title */}
   <Box
  onClick={() => navigate('/dashboard')}
  sx={{ display: 'flex', alignItems: 'center', gap: 1.3, cursor: 'pointer' }}
>
  <NotesAppLogo size={34} />
  <Typography
    variant="h5"
    sx={{
      fontWeight: 900,
      letterSpacing: 0.3,
      color: 'white',
      textShadow: '0 1px 3px rgba(0,0,0,0.25)',
    }}
  >
    NotesApp
  </Typography>
</Box>
    <Box sx={{ flexGrow: 1 }} />

    {/* Icons */}
    <Tooltip title="Refresh">
      <IconButton onClick={load} sx={{ color: 'white' }}>
        <RefreshIcon />
      </IconButton>
    </Tooltip>

    <Tooltip title={view === 'grid' ? 'Switch to list view' : 'Switch to grid view'}>
      <IconButton
        onClick={() => setView((v) => (v === 'grid' ? 'list' : 'grid'))}
        sx={{ color: 'white' }}
      >
        {view === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
      </IconButton>
    </Tooltip>

    {/* Create Note */}
    <Button
      startIcon={<AddIcon />}
      variant="contained"
      onClick={() => navigate('/editor')}
      sx={{
        ml: 1,
        borderRadius: 999,
        bgcolor: '#ffffff',
        color: T.green,
        fontWeight: 900,
        '&:hover': { bgcolor: '#fff4' },
        boxShadow: '0 10px 22px rgba(0,0,0,.16)',
      }}
    >
      Create Note
    </Button>

    {/* Profile Avatar Button */}
  <Tooltip title="Profile">
  <IconButton
    onClick={() => navigate('/profile')}
    sx={{
      ml: 1.8,
      width: 46,
      height: 46,
      borderRadius: '50%',
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
      style={{
        width: 26,
        height: 26,
        filter: 'invert(1) brightness(1.2)',
      }}
    />
  </IconButton>
</Tooltip>
  </Toolbar>
</AppBar>


      {/* HERO VIDEO — full-bleed */}
      <Box
        sx={{
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          ml: '-50vw',
          mr: '-50vw',
          height: { xs: '46vh', md: '60vh' },
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <Box
          component="video"
          src={HERO.src}
          poster={HERO.poster}
          autoPlay
          muted
          loop
          playsInline
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'saturate(1.05) contrast(1.02)',
            display: 'block',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(93,134,108,.58) 0%, rgba(93,134,108,.28) 40%, rgba(93,134,108,0) 70%)',
          }}
        />
        <Container sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ color: 'white', animation: `${pop} .35s ease` }}>
           <Typography
  variant="h3"
  sx={{
    fontWeight: 900,
    textShadow: '0 2px 12px rgba(0,0,0,.25)',
  }}
>
  Welcome to Your NotesApp Dashboard
</Typography>

<Typography
  sx={{
    opacity: 0.95,
    maxWidth: 640,
    fontSize: 18,
    mt: 0.8,
  }}
>
  A calm and creative space designed just for you — write, organize, and rediscover your thoughts effortlessly.  
  
</Typography>

            <Button
              onClick={() => navigate('/editor')}
              variant="contained"
              sx={{
                mt: 2,
                borderRadius: 999,
                bgcolor: '#ffffff',
                color: T.green,
                fontWeight: 900,
                '&:hover': { bgcolor: '#fff4' },
                boxShadow: '0 10px 22px rgba(0,0,0,.22)',
              }}
            >
              New note
            </Button>
          </Box>
        </Container>
      </Box>

      <Container sx={{ mt: 4, position: 'relative', zIndex: 2 }}>
        {/* COMMAND CENTER — gorgeous Welcome/Search card */}
        <Paper
  elevation={0}
  sx={{
    p: { xs: 2.5, md: 3 },
    borderRadius: 4,
    animation: `${pop} .28s ease`,
    position: 'relative',
    overflow: 'hidden',

    // 🌿 Elegant background with subtle texture
    background: `linear-gradient(145deg, ${T.mint} 0%, ${T.cream} 100%)`,
    border: `2px solid ${T.green}`, // ✅ Green outline
    boxShadow: `
      0 0 20px ${T.green}25,
      0 10px 25px rgba(0,0,0,0.08)
    `,

    // ✅ Hover glow for interactivity
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: `
        0 0 28px ${T.green}45,
        0 12px 28px rgba(0,0,0,0.12)
      `,
    },

    // ✅ Gentle gradient glow overlay
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 4,
      background: `radial-gradient(circle at top left, ${T.green}20, transparent 60%)`,
      pointerEvents: 'none',
    },
  }}
>

          {/* dotted pattern overlay */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(#d6eadf 1px, transparent 1px) 0 0 / 18px 18px',
              opacity: 0.35,
              pointerEvents: 'none',
            }}
          />
          <Grid container spacing={2} alignItems="center" sx={{ position: 'relative' }}>
            <Grid item xs={12} md={6.5}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: T.green }}>
                Welcome back 
              </Typography>
              <Typography sx={{ color: T.tan, mt: 0.5 }}>
                Capture ideas and find them fast with search & sort.
              </Typography>

              {/* tiny stats row */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={
                    <Badge
                      color="success"
                      variant="dot"
                      overlap="circular"
                      sx={{ mr: 0.5 }}
                    />
                  }
                  label={`${totalNotes} total notes`}
                  sx={{
                    bgcolor: '#fff',
                    borderColor: T.line,
                    border: '1px solid',
                    color: T.green,
                    fontWeight: 700,
                  }}
                  size="small"
                />
                <Chip
                  icon={<CheckCircleIcon sx={{ color: T.green }} />}
                  label={
                    visibleNotes.length === totalNotes
                      ? 'All notes shown'
                      : `${visibleNotes.length} shown`
                  }
                  sx={{
                    bgcolor: '#fff',
                    borderColor: T.line,
                    border: '1px solid',
                    color: T.green,
                    fontWeight: 700,
                  }}
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={5.5}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  justifyContent: { xs: 'stretch', md: 'flex-end' },
                  width: '100%',
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search notes…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: T.green }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    maxWidth: 520,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fff',
                      borderRadius: 999,
                      '& fieldset': { borderColor: T.line },
                      '&:hover fieldset': { borderColor: T.tan },
                      '&.Mui-focused fieldset': { borderColor: T.green },
                    },
                  }}
                />

                <Tooltip title="Sort">
                  <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                      bgcolor: '#fff',
                      border: `1px solid ${T.line}`,
                      '&:hover': { bgcolor: '#fff' },
                    }}
                  >
                    <SortIcon sx={{ color: T.green }} />
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={anchorEl}
                  open={openSort}
                  onClose={() => setAnchorEl(null)}
                >
                  <SortItem id="updatedDesc" icon={<UpdateIcon fontSize="small" />} label="Recently updated" />
                  <SortItem id="updatedAsc"  icon={<UpdateIcon fontSize="small" />} label="Oldest updated" />
                  <Divider />
                  <SortItem id="createdDesc" icon={<CalendarTodayIcon fontSize="small" />} label="Newest created" />
                  <SortItem id="createdAsc"  icon={<CalendarTodayIcon fontSize="small" />} label="Oldest created" />
                  <Divider />
                  <SortItem id="titleAsc"   icon={<TextFieldsIcon fontSize="small" />} label="Title A → Z" />
                  <SortItem id="titleDesc"  icon={<TextFieldsIcon fontSize="small" />} label="Title Z → A" />
                </Menu>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Errors */}
        {err && (
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon />}
            sx={{
              my: 2,
              borderRadius: 3,
              background: '#fff',
              border: `1px solid ${T.line}`,
            }}
          >
            {err}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {[...Array(8)].map((_, i) => (
              <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                <Box
                  sx={{
                    height: 160,
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${T.mint2} 25%, #ffffff 37%, ${T.mint2} 63%)`,
                    backgroundSize: '400% 100%',
                    animation: `${shimmer} 1.6s ease-in-out infinite`,
                    border: `1px solid ${T.line}`,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Notes */}
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
                        borderRadius: 3,
                        border: `1px solid ${T.line}`,
                        background: `linear-gradient(135deg, ${T.mint2} 0%, ${T.mint} 100%)`,
                        boxShadow: '0 8px 24px rgba(93,134,108,.12)',
                        transition: 'transform 160ms ease, box-shadow 160ms ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 32px rgba(93,134,108,.2)',
                        },
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
                      border: `1px solid ${T.line}`,
                      cursor: 'pointer',
                      backgroundColor: '#fff',
                      transition: 'background 160ms ease, transform 160ms ease',
                      '&:hover': { background: '#fffef7', transform: 'translateY(-1px)' },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: T.green }}>
                        {n.title || 'Untitled'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: T.tan, mt: 0.5 }}
                        noWrap
                      >
                        {(n.content || '').replace(/<[^>]+>/g, '') || '—'}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={new Date(n.updatedAt || n.createdAt).toLocaleString()}
                      sx={{ bgcolor: T.mint2 }}
                    />
                  </Paper>
                ))}
              </Box>
            )
          ) : (
            <Paper
              elevation={0}
              sx={{
                mt: 6,
                p: 5,
                borderRadius: 4,
                textAlign: 'center',
                background: `linear-gradient(180deg, #fff, ${T.mint2})`,
                border: `1px dashed ${T.line}`,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: T.green }}>
                No notes yet
              </Typography>
              <Typography sx={{ color: T.tan, mt: 0.5 }}>
                Click below to create your first note.
              </Typography>
              <Button
                onClick={() => navigate('/editor')}
                startIcon={<AddIcon />}
                variant="contained"
                sx={{
                  mt: 2.5,
                  bgcolor: T.green,
                  '&:hover': { bgcolor: '#4b6c57' },
                  borderRadius: 999,
                }}
              >
                Create Note
              </Button>
            </Paper>
          )
        )}

        <Box sx={{ height: 96 }} />
      </Container>

      {/* FAB */}
      <Tooltip title="Create note">
        <IconButton
          onClick={() => navigate('/editor')}
          size="large"
          sx={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            bgcolor: T.green,
            color: 'white',
            boxShadow: '0 12px 28px rgba(93,134,108,.35)',
            '&:hover': { bgcolor: '#4b6c57' },
            zIndex: 3,
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      {/* Snackbar */}
      <Snackbar
        open={refreshed}
        autoHideDuration={1400}
        onClose={() => setRefreshed(false)}
        message="Notes refreshed"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: { bgcolor: T.green } }}
      />
    </Box>
  );
}