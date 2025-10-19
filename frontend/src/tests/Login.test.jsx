import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import Login from '../pages/Login';
import client from '../api/client';
import { logEvent } from '../utils/logger';

// ---- Mocks ----
jest.mock('../api/client', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

jest.mock('../utils/logger', () => ({
  __esModule: true,
  logEvent: jest.fn(() => Promise.resolve()),
}));

let setItemSpy;
beforeEach(() => {
  jest.clearAllMocks();
  setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
  try { window.history.pushState({}, '', '/'); } catch (_) {}
});

describe('Login Page', () => {
  test('renders core UI', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /forgot password\?/i })).toBeInTheDocument();
  });

  test('shows validation error if fields are empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);
    await user.click(screen.getByRole('button', { name: /log in/i }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/email and password are required/i);
  });

  test('successful login: calls API, stores token, logs events (navigation silenced)', async () => {
    const user = userEvent.setup();

    // Silence jsdom "navigation not implemented" noise
    const consoleErr = jest.spyOn(console, 'error').mockImplementation(() => {});

    client.post.mockResolvedValueOnce({
      data: { token: 'jwt-token', user: { _id: 'u1', email: 'user@example.com' } },
    });

    renderWithProviders(<Login />);
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Secret123!');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@example.com',
        password: 'Secret123!',
      });
    });

    expect(logEvent).toHaveBeenCalledWith('info', 'auth:login:attempt', { email: 'user@example.com' });
    expect(logEvent).toHaveBeenCalledWith('info', 'auth:login:success', { email: 'user@example.com', userId: 'u1' });

    expect(setItemSpy).toHaveBeenCalledWith('token', 'jwt-token');
    expect(setItemSpy).toHaveBeenCalledWith('user', JSON.stringify({ _id: 'u1', email: 'user@example.com' }));

    // Do NOT assert window.location.href here; jsdom doesn't actually navigate
    consoleErr.mockRestore();
  });

  test('failed login: shows server error and logs fail', async () => {
    const user = userEvent.setup();

    client.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderWithProviders(<Login />);
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'badpass');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/invalid credentials/i);

    expect(logEvent).toHaveBeenCalledWith('error', 'auth:login:fail', {
      email: 'wrong@example.com',
      error: 'Invalid credentials',
    });
  });

  test('password visibility toggle works', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const pwField = screen.getByLabelText(/^password/i);
    expect(pwField).toHaveAttribute('type', 'password');

    // Click the eye icon in main form
    const iconButtons = screen.getAllByRole('button');
    const eyeButton = iconButtons.find(btn => btn.querySelector('svg'));
    await user.click(eyeButton);

    expect(screen.getByLabelText(/^password/i)).toHaveAttribute('type', 'text');
  });

  test('opens Forgot Password dialog and validates inputs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.click(screen.getByRole('button', { name: /forgot password\?/i }));
    const dialog = await screen.findByRole('dialog');

    const resetBtn = within(dialog).getByRole('button', { name: /reset password/i });
    await user.click(resetBtn);

    const err = await within(dialog).findByRole('alert');
    expect(err).toHaveTextContent(/please enter your email/i);
  });

  test('forgot password success flow: calls API and shows success message', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.click(screen.getByRole('button', { name: /forgot password\?/i }));
    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByLabelText(/^email$/i), 'fp@example.com');
    await user.type(within(dialog).getByLabelText(/^new password$/i), 'NewPass1!');
    await user.type(within(dialog).getByLabelText(/^confirm new password$/i), 'NewPass1!');

    client.post.mockResolvedValueOnce({ data: { ok: true } });
    await user.click(within(dialog).getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'fp@example.com',
        newPassword: 'NewPass1!',
      });
    });

    expect(await within(dialog).findByText(/password updated successfully/i)).toBeInTheDocument();

    expect(logEvent).toHaveBeenCalledWith('info', 'auth:forgot:attempt', { email: 'fp@example.com' });
    expect(logEvent).toHaveBeenCalledWith('info', 'auth:forgot:success', { email: 'fp@example.com' });
  });

  test('forgot password mismatch shows error', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.click(screen.getByRole('button', { name: /forgot password\?/i }));
    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByLabelText(/^email$/i), 'fp@example.com');
    await user.type(within(dialog).getByLabelText(/^new password$/i), 'NewPass1!');
    await user.type(within(dialog).getByLabelText(/^confirm new password$/i), 'Mismatch!');

    await user.click(within(dialog).getByRole('button', { name: /reset password/i }));

    const err = await within(dialog).findByRole('alert');
    expect(err).toHaveTextContent(/passwords do not match/i);
  });
});
