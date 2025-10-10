import { Container } from '@mui/material';

export default function Layout({ children }) {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {children}
    </Container>
  );
}
