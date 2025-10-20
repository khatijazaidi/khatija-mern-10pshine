// src/tests/Editor.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Editor from '../pages/Editor';
// --- silence only the "not wrapped in act(...)" warning from React during async effects ---
const realConsoleError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const msg = args?.[0];
    if (typeof msg === 'string' && msg.includes('not wrapped in act')) {
      return; // ignore this specific warning (state updated in async effect)
    }
    realConsoleError(...args);
  });
});
afterAll(() => {
  console.error.mockRestore();
});


// ---- Mocks: API client, logger, and a simple RichEditor ----
jest.mock('../api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('../utils/logger', () => ({
  logEvent: jest.fn(() => Promise.resolve()),
}));
jest.mock('../components/RichEditor', () => {
  return function MockRichEditor(props) {
    return (
      <textarea
        aria-label="rich-editor"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    );
  };
});

import client from '../api/client';
import { logEvent } from '../utils/logger';

// ---- Helper to render Editor at a route and stub navigations ----
function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:id" element={<Editor />} />
        {/* Stubs for navigate targets */}
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/profile" element={<div>Profile</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('Editor - create mode', () => {
  test('renders create mode with empty fields and status chip', async () => {
    renderAt('/editor');

    // initial view log
    expect(logEvent).toHaveBeenCalledWith('info', 'view:editor', { mode: 'create', id: undefined });

    // title & content present
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rich-editor/i)).toBeInTheDocument();

    // status chip
    expect(screen.getByText(/writing a new note/i)).toBeInTheDocument();

    // actions
    expect(screen.getByRole('button', { name: /save note/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  test('validation: saving empty shows error and does not call API', async () => {
    renderAt('/editor');

    fireEvent.click(screen.getByRole('button', { name: /save note/i }));

    expect(await screen.findByText(/please write a title or content/i)).toBeInTheDocument();
    expect(client.post).not.toHaveBeenCalled();
    expect(client.put).not.toHaveBeenCalled();
  });

  test('saves new note (POST) and navigates to dashboard', async () => {
    client.post.mockResolvedValueOnce({ data: { note: { _id: 'n1' } } });

    renderAt('/editor');

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Hello' } });
    fireEvent.change(screen.getByLabelText(/rich-editor/i), { target: { value: '<p>World</p>' } });

    fireEvent.click(screen.getByRole('button', { name: /save note/i }));

    await waitFor(() =>
      expect(client.post).toHaveBeenCalledWith('/notes', {
        title: 'Hello',
        content: '<p>World</p>',
      })
    );

    // logs around save
    expect(logEvent).toHaveBeenCalledWith(
      'info',
      'note:save:attempt',
      expect.objectContaining({ mode: 'create', titleLen: 5 })
    );
    expect(logEvent).toHaveBeenCalledWith(
      'info',
      'note:save:success',
      expect.objectContaining({ mode: 'create' })
    );

    // navigated
    expect(await screen.findByText(/dashboard/i)).toBeInTheDocument();
  });

  test('debounced typing logs for title (400ms) and content (500ms)', async () => {
    renderAt('/editor');

    // Title
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Abc' } });
    await act(async () => jest.advanceTimersByTime(399));
    expect(logEvent).not.toHaveBeenCalledWith('info', 'note:change:title', expect.anything());
    await act(async () => jest.advanceTimersByTime(1));
    expect(logEvent).toHaveBeenCalledWith(
      'info',
      'note:change:title',
      expect.objectContaining({ length: 3 })
    );

    // Content
    fireEvent.change(screen.getByLabelText(/rich-editor/i), { target: { value: '<p>xyz</p>' } });
    await act(async () => jest.advanceTimersByTime(499));
    expect(logEvent).not.toHaveBeenCalledWith('info', 'note:change:content', expect.anything());
    await act(async () => jest.advanceTimersByTime(1));
    expect(logEvent).toHaveBeenCalledWith(
      'info',
      'note:change:content',
      expect.objectContaining({ length: 3 })
    );
  });

  test('Cancel button logs and navigates to dashboard', async () => {
    renderAt('/editor');

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(logEvent).toHaveBeenCalledWith('info', 'nav:editor->dashboard', { reason: 'cancel' });
    expect(await screen.findByText(/dashboard/i)).toBeInTheDocument();
  });
});

describe('Editor - edit mode', () => {
  test('loads existing note (GET), populates fields, logs success', async () => {
    client.get.mockResolvedValueOnce({
      data: { note: { title: 'T1', content: '<p>C1</p>' } },
    });

    renderAt('/editor/abc123');

    // initial view log
    expect(logEvent).toHaveBeenCalledWith('info', 'view:editor', { mode: 'edit', id: 'abc123' });

    await waitFor(() => expect(client.get).toHaveBeenCalledWith('/notes/abc123'));

    expect(screen.getByDisplayValue('T1')).toBeInTheDocument();
    expect(screen.getByLabelText(/rich-editor/i)).toHaveValue('<p>C1</p>');
    expect(screen.getByText(/editing note/i)).toBeInTheDocument();

    expect(logEvent).toHaveBeenCalledWith('info', 'note:load:attempt', { id: 'abc123' });
    expect(logEvent).toHaveBeenCalledWith('info', 'note:load:success', { id: 'abc123' });
  });

  test('PUT on save and navigate', async () => {
    client.get.mockResolvedValueOnce({ data: { note: { title: 'Old', content: '<p>Old</p>' } } });
    client.put.mockResolvedValueOnce({ data: { ok: true } });

    renderAt('/editor/xyz9');

    await waitFor(() => expect(client.get).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Title' } });
    fireEvent.change(screen.getByLabelText(/rich-editor/i), { target: { value: '<p>New</p>' } });

    fireEvent.click(screen.getByRole('button', { name: /save note/i }));

    await waitFor(() =>
      expect(client.put).toHaveBeenCalledWith('/notes/xyz9', {
        title: 'New Title',
        content: '<p>New</p>',
      })
    );

    expect(logEvent).toHaveBeenCalledWith(
      'info',
      'note:save:attempt',
      expect.objectContaining({ id: 'xyz9', mode: 'edit', titleLen: 'New Title'.length })
    );
    expect(logEvent).toHaveBeenCalledWith(
      'info',
      'note:save:success',
      expect.objectContaining({ id: 'xyz9', mode: 'edit' })
    );

    expect(await screen.findByText(/dashboard/i)).toBeInTheDocument();
  });

  test('delete flow: opens dialog and calls DELETE on confirm', async () => {
    client.get.mockResolvedValueOnce({ data: { note: { title: 'T', content: 'C' } } });
    client.delete.mockResolvedValueOnce({ data: { ok: true } });

    renderAt('/editor/note-1');

    await waitFor(() => expect(client.get).toHaveBeenCalled());

    // open confirm dialog
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // confirm delete
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => expect(client.delete).toHaveBeenCalledWith('/notes/note-1'));
    expect(logEvent).toHaveBeenCalledWith('info', 'note:delete:attempt', { id: 'note-1' });
    expect(logEvent).toHaveBeenCalledWith('info', 'note:delete:success', { id: 'note-1' });

    // navigated
    expect(await screen.findByText(/dashboard/i)).toBeInTheDocument();
  });
});

describe('Editor - UX polish & nav extras', () => {
 test('shows loading spinner while fetching in edit mode', async () => {
  let resolveGet;
  const pending = new Promise((resolve) => { resolveGet = resolve; });
  client.get.mockReturnValueOnce(pending);

  const utils = renderAt('/editor/spin-1');

  // Ensure the GET was actually invoked before we resolve it
  await waitFor(() => expect(client.get).toHaveBeenCalledWith('/notes/spin-1'));

  // Spinner visible
  expect(screen.getByRole('progressbar')).toBeInTheDocument();

  // Resolve the GET inside act to satisfy React's state updates
  await act(async () => {
    resolveGet({ data: { note: { title: 'Loaded', content: '<p>Ok</p>' } } });
  });

  await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  expect(screen.getByDisplayValue('Loaded')).toBeInTheDocument();

  utils.unmount();
});


  test('profile avatar navigates to /profile and logs', async () => {
    renderAt('/editor');

    const profileBtn = screen.getByRole('button', { name: /profile/i });
    fireEvent.click(profileBtn);

    expect(logEvent).toHaveBeenCalledWith('info', 'nav:editor->profile');
    expect(await screen.findByText(/profile/i)).toBeInTheDocument();
  });

  test('logout clears storage, logs, and goes to /login', async () => {
    localStorage.setItem('token', 'abc');
    renderAt('/editor');

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(logEvent).toHaveBeenCalledWith('info', 'user:logout');
    expect(await screen.findByText(/login/i)).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('delete dialog cancel closes the dialog and does not call DELETE', async () => {
    client.get.mockResolvedValueOnce({ data: { note: { title: 'T', content: 'C' } } });
    renderAt('/editor/cancel-del');

    await waitFor(() => expect(client.get).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    expect(client.delete).not.toHaveBeenCalled();
  });
});

describe('Editor - error handling', () => {
  test('load error shows alert and logs error', async () => {
    client.get.mockRejectedValueOnce({
      response: { data: { message: 'Not found' } },
    });

    renderAt('/editor/bad-1');

    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith('error', 'note:load:fail', {
      id: 'bad-1',
      error: 'Not found',
    });
  });

  test('save error (create) shows alert and logs error', async () => {
    client.post.mockRejectedValueOnce({
      response: { data: { message: 'Validation failed' } },
    });

    renderAt('/editor');
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/rich-editor/i), { target: { value: '<p>Y</p>' } });

    fireEvent.click(screen.getByRole('button', { name: /save note/i }));

    expect(await screen.findByText(/validation failed/i)).toBeInTheDocument();

    expect(logEvent).toHaveBeenCalledWith(
      'info',
      'note:save:attempt',
      expect.objectContaining({ mode: 'create' })
    );
    expect(logEvent).toHaveBeenCalledWith(
      'error',
      'note:save:fail',
      expect.objectContaining({ mode: 'create', error: 'Validation failed' })
    );
  });

  test('save error (edit) shows alert and logs error', async () => {
    client.get.mockResolvedValueOnce({ data: { note: { title: 'Old', content: 'C' } } });
    client.put.mockRejectedValueOnce({ response: { data: { message: 'Update blocked' } } });

    renderAt('/editor/e-1');

    await waitFor(() => expect(client.get).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New' } });
    fireEvent.click(screen.getByRole('button', { name: /save note/i }));

    expect(await screen.findByText(/update blocked/i)).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith(
      'error',
      'note:save:fail',
      expect.objectContaining({ id: 'e-1', mode: 'edit', error: 'Update blocked' })
    );
  });

  test('delete error shows alert and logs error', async () => {
    client.get.mockResolvedValueOnce({ data: { note: { title: 'T', content: 'C' } } });
    client.delete.mockRejectedValueOnce({ response: { data: { message: 'Delete failed (srv)' } } });

    renderAt('/editor/d-err');

    await waitFor(() => expect(client.get).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(await screen.findByText(/delete failed \(srv\)/i)).toBeInTheDocument();

    expect(logEvent).toHaveBeenCalledWith('error', 'note:delete:fail', {
      id: 'd-err',
      error: 'Delete failed (srv)',
    });
  });

  test('generic errors (no response.message) fall back to default messages', async () => {
  // LOAD
  client.get.mockRejectedValueOnce(new Error('boom'));
  let utils = renderAt('/editor/g-1');
  expect(await screen.findByText(/failed to load note/i)).toBeInTheDocument();
  utils.unmount();

  // CREATE SAVE
  client.post.mockRejectedValueOnce(new Error('boom'));
  utils = renderAt('/editor');
  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 't' } });
  fireEvent.change(screen.getByLabelText(/rich-editor/i), { target: { value: '<p>c</p>' } });
  fireEvent.click(screen.getByRole('button', { name: /save note/i }));
  expect(await screen.findByText(/save failed/i)).toBeInTheDocument();
  utils.unmount();

 // EDIT SAVE
client.get.mockResolvedValueOnce({ data: { note: { title: 'A', content: 'B' } } });
client.put.mockRejectedValueOnce(new Error('boom'));

utils = renderAt('/editor/g-2');

// Wait until loading has finished and actions are visible
await waitFor(() => expect(client.get).toHaveBeenCalledWith('/notes/g-2'));
await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

// Now the Save button exists; click it to trigger the PUT error path
fireEvent.click(await screen.findByRole('button', { name: /save note/i }));
expect(await screen.findByText(/save failed/i)).toBeInTheDocument();
utils.unmount();


 // DELETE (generic error)
client.get.mockResolvedValueOnce({ data: { note: { title: 'A', content: 'B' } } });
client.delete.mockRejectedValueOnce(new Error('boom'));
utils = renderAt('/editor/g-3');

// Wait until fetch resolved and spinner gone, then wait for the button to exist
await waitFor(() => expect(client.get).toHaveBeenCalledWith('/notes/g-3'));
await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

const deleteBtn = await screen.findByRole('button', { name: /delete/i });
fireEvent.click(deleteBtn);

const confirmBtn = await screen.findByRole('button', { name: /^delete$/i });
fireEvent.click(confirmBtn);

expect(await screen.findByText(/delete failed/i)).toBeInTheDocument();
utils.unmount();

});

});
