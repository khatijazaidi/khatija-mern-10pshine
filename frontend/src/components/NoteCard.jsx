// src/components/NoteCard.jsx
import { Card, CardContent, Typography, Box, CardActionArea, Grid } from "@mui/material";


const COLORS = {
  cream: "#FEFAE0",
  sand:  "#E6D8C3",
  tan:   "#C2A68C",
  green: "#5D866C",
  mint:  "#9AB89E",
  line:  "#D9E4DC",
};

function cleanText(input = "") {
  const el = document.createElement("textarea");
  el.innerHTML = String(input);
  let s = el.value;                           
  s = s.replace(/<[^>]*>/g, " ");            
  s = s.replace(/\u00A0/g, " ");             
  s = s.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, ""); 
  s = s.normalize("NFKC").replace(/\p{M}+/gu, ""); 
  return s.replace(/\s+/g, " ").trim();
}
function limitWords(text, maxWords = 10) {
  const w = text.split(/\s+/);
  return w.length <= maxWords ? text : w.slice(0, maxWords).join(" ") + "…";
}


export default function NoteCard({ note = {}, onClick }) {
  const title   = cleanText(note.title || "Untitled Note");
  const content = limitWords(cleanText(note.content || ""), 10); 

  return (
    <Card
      elevation={0}
      sx={{
        width: 360,
        height: 260,
        borderRadius: 3,
        overflow: "hidden",
        border: `2px solid ${COLORS.green}`,
        background: `linear-gradient(145deg, ${COLORS.cream}, ${COLORS.sand}F5)`,
        boxShadow: `
          0 6px 18px rgba(93,134,108,0.15),
          inset 0 1px 0 rgba(255,255,255,0.7)
        `,
        transition: "transform .22s ease, box-shadow .22s ease, border-color .22s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: `
            0 12px 28px rgba(93,134,108,0.25),
            inset 0 1px 0 rgba(255,255,255,0.85)
          `,
          borderColor: COLORS.mint,
        },
      }}
      onClick={onClick}
    >
      <CardActionArea sx={{ height: "100%" }}>
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 3, // breathing space
          }}
        >
       
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: COLORS.green,
              fontSize: "1.45rem",
              lineHeight: 1.3,
              mb: 1,
              wordBreak: "break-word",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
            title={title}
          >
            {title}
          </Typography>

      
          <Typography
            variant="body1"
            sx={{
              color: "#333",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              whiteSpace: "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mb: 1.5,
              flexGrow: 1,
            }}
            title={cleanText(note.content || "")}
          >
            {content || "No content available."}
          </Typography>

          
          <Box
            sx={{
              borderTop: `1px solid ${COLORS.sand}`,
              pt: 1,
              mt: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: COLORS.tan, fontSize: ".95rem", fontWeight: 700 }}
            >
              {note.updatedAt
                ? `Last updated: ${new Date(note.updatedAt).toLocaleDateString()}`
                : ""}
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.4,
                borderRadius: 999,
                fontSize: ".9rem",
                color: COLORS.green,
                border: `1px solid ${COLORS.green}55`,
                background: `linear-gradient(135deg, ${COLORS.mint}22, ${COLORS.green}15)`,
                fontWeight: 800,
              }}
            >
              note
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}


export function NoteCardsGrid({ notes = [], onNoteClick }) {
  return (
    <Grid
      container
      spacing={3}
      justifyContent="center"
      alignItems="flex-start"
      sx={{ mt: 3, px: 2, overflow: "hidden" }}
    >
      {notes.map((n) => (
        <Grid
          item
          key={n._id || n.id}
          xs={12}  
          sm={6}   
          md={4}   
          display="flex"
          justifyContent="center"
        >
          <NoteCard note={n} onClick={() => onNoteClick?.(n)} />
        </Grid>
      ))}
    </Grid>
  );
}