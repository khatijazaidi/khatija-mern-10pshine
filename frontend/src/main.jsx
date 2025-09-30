import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { logError, logInfo } from './utils/logger';
import ErrorBoundary from './components/ErrorBoundary';


// app boot
logInfo('app:boot', { ts: Date.now() });

window.addEventListener('error', (e) => {
  logError('window.error', { message: e.message, stack: e.error?.stack });
});

window.addEventListener('unhandledrejection', (e) => {
  logError('unhandledrejection', { reason: String(e.reason) });
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <ErrorBoundary><App /></ErrorBoundary>
  </ThemeProvider>
);
