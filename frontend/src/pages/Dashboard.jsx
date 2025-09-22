import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import NoteCard from '../components/NoteCard';
// import Navbar from '../components/Navbar'; // will come in profile-ui branch; temporarily comment if not yet added

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setErr('');
    client.get('/notes')
      .then(res => setNotes(res.data.notes || []))
      .catch(e => setErr(e.response?.data?.message || 'Failed to fetch notes'));
  };

  useEffect(load, []);

  return (
    <>
      {/* <Navbar/> add in profile-ui branch */}
      <Container sx={{ mt: 4 }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
          <Typography variant="h4">My Notes</Typography>
          <Button variant="contained" onClick={()=>navigate('/editor')}>Create Note</Button>
        </Box>
        {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}
        <Grid container spacing={2}>
          {notes.map(n => (
            <Grid item xs={12} sm={6} md={4} key={n._id}>
              <NoteCard note={n} onClick={()=>navigate(`/editor/${n._id}`)} />
            </Grid>
          ))}
          {!notes.length && !err && (
            <Grid item xs={12}><Typography color="text.secondary">No notes yet. Create one!</Typography></Grid>
          )}
        </Grid>
      </Container>
    </>
  );
}
