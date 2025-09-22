import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ display:'flex', gap:2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor:'pointer' }} onClick={()=>navigate('/dashboard')}>
          Notes App
        </Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {user?.name ? `Hi, ${user.name}` : ''}
          </Typography>
          <Button color="inherit" onClick={()=>navigate('/dashboard')}>Dashboard</Button>
          <Button color="inherit" onClick={()=>navigate('/editor')}>New Note</Button>
          <Button color="inherit" onClick={()=>navigate('/profile')}>Profile</Button>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
