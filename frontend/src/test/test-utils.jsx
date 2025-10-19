import { render } from '@testing-library/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import theme from '../theme'; // adjust path if your theme is elsewhere

export function renderWithProviders(ui, { route = '/', ...options } = {}) {
  window.history.pushState({}, 'Test', route);

  const Wrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>{children}</BrowserRouter>
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}
