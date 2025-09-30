import { Component } from 'react';
import { Alert, Container } from '@mui/material';
import { logError } from '../utils/logger';

export default class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) {
    logError('react:errorBoundary', { error: String(error), info });
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Something went wrong. Please refresh.</Alert>
      </Container>
    );
  }
}
