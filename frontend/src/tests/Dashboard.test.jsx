import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import Dashboard from '../pages/Dashboard';
import client from '../api/client';
import { logEvent } from '../utils/logger';

// --- Mocks ---
jest.mock('../api/client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('../utils/logger', () => ({
  __esModule: true,
  logEvent: jest.fn(() => Promise.resolve()),
}));

// Simplify NoteCard to a clickable button we can assert on
jest.mock('../components/NoteCard', () => ({
  __esModule: true,
  default: ({ note, onClick }) => (
    <button data-testid={`note-${note._id}`} onClick={onClick}>
      {note.title || 'Untitled'}
    </button>
  ),
}));

// Spy on navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// --- Silence MUI Grid migration warnings (noise only) ---
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].startsWith('MUI Grid:')) return;
    originalWarn(...args);
  };
});
afterAll(() => {
  console.warn = originalWarn;
});

let setItemSpy, clearSpy;

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigate.mockReset();
  setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
  clearSpy = jest.spyOn(Storage.prototype, 'clear');

  localStorage.removeItem('dash:view');
  localStorage.removeItem('dash:sort');

  // default successful response
  client.get.mockResolvedValue({
    data: {
      notes: [
        { _id: 'n1', title: 'Alpha', content: 'first', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
        { _id: 'n2', title: 'Beta', content: 'second', createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-04-01T00:00:00Z' },
      ],
    },
  });
});

describe('Dashboard Page', () => {
  test('loads notes on mount, shows skeleton then notes + snackbar', async () => {
    renderWithProviders(<Dashboard />);

    // fetch attempt
    expect(logEvent).toHaveBeenCalledWith('info', 'notes:fetch:attempt');

    // success logged with count
    await waitFor(() => {
      expect(logEvent).toHaveBeenCalledWith('info', 'notes:fetch:success', { count: 2 });
    });

    // notes appear
    expect(screen.getByTestId('note-n1')).toHaveTextContent('Alpha');
    expect(screen.getByTestId('note-n2')).toHaveTextContent('Beta');

    // snackbar feedback
    expect(await screen.findByText(/notes refreshed/i)).toBeInTheDocument();
  });

  test('shows error alert if fetch fails', async () => {
    client.get.mockRejectedValueOnce({
      response: { data: { message: 'Failed to fetch notes' } },
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(logEvent).toHaveBeenCalledWith('error', 'notes:fetch:fail', { error: 'Failed to fetch notes' });
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to fetch notes/i);
  });

  test('search filters visible notes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await screen.findByTestId('note-n1');
    await user.type(screen.getByPlaceholderText(/search notes/i), 'alp');

    // Alpha matches, Beta filtered out
    expect(screen.getByTestId('note-n1')).toBeInTheDocument();
    expect(screen.queryByTestId('note-n2')).toBeNull();
  });

  test('sort change persists to localStorage and affects order', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await screen.findByTestId('note-n1');

    // Open sort menu
    await user.click(screen.getByRole('button', { name: /sort/i }));
    // Choose "Title Z → A"
    await user.click(screen.getByRole('menuitem', { name: /title z → a/i }));

    // localStorage records sort
    expect(setItemSpy).toHaveBeenCalledWith('dash:sort', 'titleDesc');

    // Now Beta should appear before Alpha in DOM order
    const allButtons = screen.getAllByRole('button').map((b) => b.textContent);
    const joined = allButtons.join('|');
    expect(joined.indexOf('Beta')).toBeLessThan(joined.indexOf('Alpha'));
  });

  test('Refresh button refetches and logs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await screen.findByTestId('note-n1');
    await user.click(screen.getByRole('button', { name: /refresh/i }));

    expect(logEvent).toHaveBeenCalledWith('info', 'notes:refresh:click');
    expect(logEvent).toHaveBeenCalledWith('info', 'notes:fetch:attempt');
  });

  test('navigation: Create Note, FAB, Profile, Logout', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await screen.findByTestId('note-n1');

    // AppBar "Create Note" (scope to header/banner)
    const appBar = screen.getByRole('banner');
    await user.click(within(appBar).getByRole('button', { name: /create note/i }));
    expect(logEvent).toHaveBeenCalledWith('info', 'nav:dashboard->editor');
    expect(mockNavigate).toHaveBeenCalledWith('/editor');

    mockNavigate.mockClear();
    logEvent.mockClear();

    // FAB "Create note" (icon button with aria-label, no visible text)
    const fab = screen
      .getAllByRole('button', { name: /create note/i })
      .find((btn) => (btn.textContent || '').trim() === '');
    await user.click(fab);
    expect(mockNavigate).toHaveBeenCalledWith('/editor');

    mockNavigate.mockClear();

    // Profile icon (tooltip "Profile" exposes accessible name)
    await user.click(screen.getByRole('button', { name: /profile/i }));
    expect(logEvent).toHaveBeenCalledWith('info', 'nav:dashboard->profile');
    expect(mockNavigate).toHaveBeenCalledWith('/profile');

    mockNavigate.mockClear();

    // Logout clears storage + navigates
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(clearSpy).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('clicking a note navigates to editor/:id and logs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    const note = await screen.findByTestId('note-n2'); // Beta
    await user.click(note);

    expect(logEvent).toHaveBeenCalledWith('info', 'open:note', { id: 'n2', title: 'Beta' });
    expect(mockNavigate).toHaveBeenCalledWith('/editor/n2');
  });

  // ---- added critical cases ----
  test('empty state when no notes → shows panel + CTA navigates', async () => {
  const user = userEvent.setup();

  // return no notes for the initial fetch
  client.get.mockResolvedValueOnce({ data: { notes: [] } });

  renderWithProviders(<Dashboard />);

  // wait for the empty panel to show up
  const emptyTitle = await screen.findByText(/no notes yet/i);

  // scope queries to the empty-state panel container
  // (grab a stable ancestor; two options below—either works)
  const panel =
    emptyTitle.closest('div') || // often the immediate Typography wrapper
    screen.getByText(/click below to create your first note/i).closest('div');

  // click the CTA inside the empty panel (avoids the AppBar button and the FAB)
  await user.click(within(panel).getByRole('button', { name: /create note/i }));

  expect(mockNavigate).toHaveBeenCalledWith('/editor');
});


  test('search with no results → empty UI', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await screen.findByTestId('note-n1'); // wait for load

    await user.type(screen.getByPlaceholderText(/search notes/i), 'zzzzzz');

    // no cards visible
    expect(screen.queryByTestId('note-n1')).toBeNull();
    expect(screen.queryByTestId('note-n2')).toBeNull();

    // empty panel shown
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
  });

  test('refresh failure shows error alert and logs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await screen.findByTestId('note-n1'); // loaded once

    // make the next fetch fail (the refresh call)
    client.get.mockRejectedValueOnce({
      response: { data: { message: 'Network down' } },
    });

    await user.click(screen.getByRole('button', { name: /refresh/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/network down/i);
    expect(logEvent).toHaveBeenCalledWith('error', 'notes:fetch:fail', { error: 'Network down' });
  });
});
