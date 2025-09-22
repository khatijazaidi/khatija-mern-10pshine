import { Card, CardContent, Typography } from '@mui/material';

export default function NoteCard({ note, onClick }) {
  const snippet = (note.content || '').replace(/<[^>]+>/g,'').slice(0, 140);
  return (
    <Card onClick={onClick} sx={{ cursor:'pointer', height:'100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{note.title || 'Untitled'}</Typography>
        <Typography variant="body2" color="text.secondary">{snippet}</Typography>
      </CardContent>
    </Card>
  );
}
