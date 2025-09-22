// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Button, Box,
  Alert, Skeleton, IconButton, Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import client from '../api/client';
import NoteCard from '../components/NoteCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setErr('');
    setLoading(true);
    try {
      const res = await client.get('/notes');          // <-- hits your backend
      setNotes(res.data?.notes || []);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      {/* Top bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">My Notes</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={load}><RefreshIcon /></IconButton>
          </Tooltip>
          <Button variant="contained" onClick={() => navigate('/editor')}>
            Create Note
          </Button>
        </Box>
      </Box>

      {/* Error message */}
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      {/* Loading skeletons */}
      {loading && (
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid key={i} item xs={12} sm={6} md={4}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Notes grid */}
      {!loading && (
        <>
          {notes.length ? (
            <Grid container spacing={2}>
              {notes.map((n) => (
                <Grid key={n._id} item xs={12} sm={6} md={4}>
                  <NoteCard note={n} onClick={() => navigate(`/editor/${n._id}`)} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ mt: 6, textAlign: 'center', opacity: 0.8 }}>
              <Typography>No notes yet.</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Click “Create Note” to add your first one.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
