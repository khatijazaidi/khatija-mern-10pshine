import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0A400C' },
    secondary: { main: '#819067' },
    background: {
      default: '#FEFAE0',
      paper: '#FEFAE0',
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } }
  }
});

export default theme;