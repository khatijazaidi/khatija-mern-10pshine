import { Card, CardContent, Typography, Box } from '@mui/material';

const COLORS = {
  cream: '#FEFAE0',
  sand: '#E6D8C3',
  tan: '#C2A68C',
  green: '#5D866C',
  mint: '#9AB89E'
};

export default function NoteCard({ note, onClick }) {
  const snippet = (note.content || '').replace(/<[^>]+>/g, '').slice(0, 140);

  return (
   <Card
  onClick={onClick}
  sx={{
    cursor: 'pointer',
    height: '100%',
    borderRadius: 3,
    position: 'relative',
    background: `linear-gradient(145deg, ${COLORS.cream}, ${COLORS.sand}cc)`,
    border: `2px solid ${COLORS.green}`,   // ✅ Green outline
    boxShadow: '0 6px 18px rgba(93,134,108,0.15)',
    transition: 'all 0.25s ease',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: '0 12px 28px rgba(93,134,108,0.25)',
      borderColor: COLORS.mint,            // ✅ Subtle hover glow
    },
  }}
>

      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 800,
            fontSize: '1.1rem',
            color: COLORS.green,
            mb: 1,
            letterSpacing: 0.2,
          }}
        >
          {note.title || 'Untitled Note'}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#3c3c3c',
            lineHeight: 1.6,
            mb: 1,
          }}
        >
          {snippet || 'No content available.'}
        </Typography>

        {/* Optional Footer Meta */}
        {note.updatedAt && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              color: COLORS.tan,
              mt: 2,
            }}
          >
            <Typography variant="caption">
              Last updated: {new Date(note.updatedAt).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}