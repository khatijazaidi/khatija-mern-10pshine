import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import Signup from '../pages/Signup';
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

// ✅ Silence jsdom "Not implemented: navigation" (string or Error object)
let consoleErrorSpy;
beforeAll(() => {
  const realError = console.error;
  const shouldSilence = (arg) =>
    (typeof arg === 'string' && arg.includes('Not implemented: navigation')) ||
    (arg && typeof arg.message === 'string' && arg.message.includes('Not implemented: navigation'));

  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
    const first = args[0];
    if (shouldSilence(first)) return; // swallow jsdom nav warning
    realError(...args);               // pass everything else through
  });
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
  try { window.history.pushState({}, '', '/signup'); } catch (_) {}
});

describe('Signup Page', () => {
  test('renders core UI', () => {
    renderWithProviders(<Signup />);

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });

  test('shows validation error when fields are empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Signup />);

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/all fields are required/i);
  });

  test('successful signup: calls API, shows success, logs events (navigation warning silenced globally)', async () => {
    const user = userEvent.setup();

    client.post.mockResolvedValueOnce({ data: { ok: true } });

    renderWithProviders(<Signup />);

    await user.type(screen.getByLabelText(/full name/i), 'Alice Doe');
    await user.type(screen.getByLabelText(/email address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Secret123!');

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Alice Doe',
        email: 'alice@example.com',
        password: 'Secret123!',
      });
    });

    expect(logEvent).toHaveBeenCalledWith('info', 'auth:signup:attempt', { name: 'Alice Doe', email: 'alice@example.com' });
    expect(logEvent).toHaveBeenCalledWith('info', 'auth:signup:success', { name: 'Alice Doe', email: 'alice@example.com' });

    // Success alert appears
    expect(await screen.findByRole('alert')).toHaveTextContent(/account created\. please log in\./i);

    // We intentionally do NOT assert on window.location.href due to jsdom limitations
  });

  test('failed signup: shows server error and logs fail', async () => {
    const user = userEvent.setup();

    client.post.mockRejectedValueOnce({
      response: { data: { message: 'Email already in use' } },
    });

    renderWithProviders(<Signup />);

    await user.type(screen.getByLabelText(/full name/i), 'Bob Smith');
    await user.type(screen.getByLabelText(/email address/i), 'bob@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Secret123!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/email already in use/i);

    expect(logEvent).toHaveBeenCalledWith('error', 'auth:signup:fail', {
      name: 'Bob Smith',
      email: 'bob@example.com',
      error: 'Email already in use',
    });
  });

  test('password eye toggle works', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Signup />);

    const pw = screen.getByLabelText(/^password$/i);
    expect(pw).toHaveAttribute('type', 'password');

    // Click the eye icon near password (button that contains an SVG)
    const eyeBtn = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));
    await user.click(eyeBtn);

    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'text');
  });
});
