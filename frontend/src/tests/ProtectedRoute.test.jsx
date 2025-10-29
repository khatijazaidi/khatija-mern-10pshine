import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

function PrivatePage() {
  return <div>Secret Area</div>;
}
function LoginPage() {
  return <div>Login Page</div>;
}

const renderAt = (initialPath = '/private') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/private"
          element={
            <ProtectedRoute>
              <PrivatePage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('redirects to /login when token is missing', async () => {
    renderAt('/private');

    // not the private page
    expect(screen.queryByText(/secret area/i)).not.toBeInTheDocument();
    // redirected login page renders
    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });

  test('renders children when token is present', async () => {
    localStorage.setItem('token', 'test-token');
    renderAt('/private');

    expect(await screen.findByText(/secret area/i)).toBeInTheDocument();
    expect(screen.queryByText(/login page/i)).not.toBeInTheDocument();
  });
});
