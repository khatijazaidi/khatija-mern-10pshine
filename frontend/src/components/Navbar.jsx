// src/components/Navbar.jsx
import { useMemo, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Menu, MenuItem, Divider, Tooltip, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  const initials = useMemo(() => {
    if (!user?.name) return 'U';
    const [f = '', l = ''] = String(user.name).split(' ');
    return (f[0] || 'U').toUpperCase() + (l[0] ? l[0].toUpperCase() : '');
  }, [user?.name]);

  const [mobileEl, setMobileEl] = useState(null);
  const [userEl, setUserEl] = useState(null);
  const [confirmOut, setConfirmOut] = useState(false);

  const openMobile = Boolean(mobileEl);
  const openUser = Boolean(userEl);

  const go = (path) => {
    navigate(path);
    setMobileEl(null);
    setUserEl(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          {/* Mobile menu button */}
          <IconButton
            edge="start"
            color="inherit"
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            onClick={(e) => setMobileEl(e.currentTarget)}
          >
            <MenuIcon />
          </IconButton>

          {/* Brand */}
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 700, letterSpacing: 0.2 }}
            onClick={() => go('/dashboard')}
          >
            Notes App
          </Typography>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button
              color={isActive('/dashboard') ? 'secondary' : 'inherit'}
              startIcon={<HomeIcon />}
              onClick={() => go('/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              color={isActive('/editor') ? 'secondary' : 'inherit'}
              startIcon={<AddIcon />}
              onClick={() => go('/editor')}
            >
              New Note
            </Button>
            <Button
              color={isActive('/profile') ? 'secondary' : 'inherit'}
              startIcon={<PersonIcon />}
              onClick={() => go('/profile')}
            >
              Profile
            </Button>
          </Box>

          {/* User avatar / menu */}
          <Tooltip title={user?.name ? `Signed in as ${user.name}` : 'Account'}>
            <IconButton color="inherit" onClick={(e) => setUserEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32 }}>{initials}</Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Mobile menu */}
      <Menu
        anchorEl={mobileEl}
        open={openMobile}
        onClose={() => setMobileEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MenuItem selected={isActive('/dashboard')} onClick={() => go('/dashboard')}>
          <HomeIcon fontSize="small" style={{ marginRight: 8 }} /> Dashboard
        </MenuItem>
        <MenuItem selected={isActive('/editor')} onClick={() => go('/editor')}>
          <AddIcon fontSize="small" style={{ marginRight: 8 }} /> New Note
        </MenuItem>
        <MenuItem selected={isActive('/profile')} onClick={() => go('/profile')}>
          <PersonIcon fontSize="small" style={{ marginRight: 8 }} /> Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setConfirmOut(true)}>
          <LogoutIcon fontSize="small" style={{ marginRight: 8 }} /> Logout
        </MenuItem>
      </Menu>

      {/* User menu */}
      <Menu
        anchorEl={userEl}
        open={openUser}
        onClose={() => setUserEl(null)}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem disabled>
          {user?.name || 'Unnamed User'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => go('/profile')}>
          <PersonIcon fontSize="small" style={{ marginRight: 8 }} /> Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setConfirmOut(true)}>
          <LogoutIcon fontSize="small" style={{ marginRight: 8 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Logout confirm */}
      <Dialog open={confirmOut} onClose={() => setConfirmOut(false)}>
        <DialogTitle>Log out?</DialogTitle>
        <DialogContent>You'll need to log in again to access your notes.</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOut(false)}>Cancel</Button>
          <Button color="error" onClick={logout} startIcon={<LogoutIcon />}>Logout</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
