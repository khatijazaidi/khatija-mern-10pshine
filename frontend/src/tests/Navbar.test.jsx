// src/tests/Navbar.test.jsx
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Mock navigate so redirects don't break tests
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
  };
});

describe('Navbar Component', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ name: 'Alice' }));
    localStorage.setItem('token', 'abc');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders title and main nav buttons', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Title
    expect(screen.getByRole('heading', { name: /notes app/i })).toBeInTheDocument();

    // Desktop nav buttons
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new note/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();

    // Avatar shows initial "A" for Alice (used to open user menu)
    expect(screen.getByText(/^A$/)).toBeInTheDocument();
  });

  test('clears storage on logout via user menu + confirm dialog', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // 1) Open the *user* menu by clicking the avatar button.
    // The Avatar renders the initial "A" inside the button, so use that to locate the button.
    const avatarInitial = screen.getByText(/^A$/);
    const avatarButton = avatarInitial.closest('button');
    expect(avatarButton).toBeTruthy();
    await user.click(avatarButton);

    // 2) Click "Logout" in the user menu (this opens the confirm dialog).
    const logoutMenuItem = await screen.findByRole('menuitem', { name: /\blogout\b/i });
    await user.click(logoutMenuItem);

    // 3) Confirm logout in the dialog by clicking the red "Logout" button.
    const dialog = await screen.findByRole('dialog'); // the MUI <Dialog />
    const logoutConfirmBtn = within(dialog).getByRole('button', { name: /^\s*logout\s*$/i });
    await user.click(logoutConfirmBtn);

    // 4) Assert localStorage cleared
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
