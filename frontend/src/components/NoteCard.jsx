// src/components/NoteCard.jsx
import { Card, CardContent, Typography } from '@mui/material';

function stripHtml(html = '') {
  // quick, safe snippet for list view
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

export default function NoteCard({ note, onClick }) {
  const title = note.title?.trim() || 'Untitled';
  const snippet = stripHtml(note.content).slice(0, 140); // 140 chars preview

  return (
    <Card onClick={onClick} sx={{ cursor: 'pointer', height: '100%' }} elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom noWrap>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {snippet || '—'}
        </Typography>
      </CardContent>
    </Card>
  );
}
