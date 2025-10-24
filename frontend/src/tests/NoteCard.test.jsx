/**
 * Unit tests for NoteCard + NoteCardsGrid
 * Covers:
 * - HTML stripping + whitespace cleanup (via cleanText – indirectly)
 * - 10-word truncation with ellipsis
 * - Default title/content behavior
 * - UpdatedAt label presence
 * - onClick fired (NoteCard)
 * - onNoteClick fired with the right note (NoteCardsGrid)
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils'; // has Theme + Router
import NoteCard, { NoteCardsGrid } from '../components/NoteCard';

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

describe('NoteCard', () => {
  test('renders title and cleaned snippet (HTML removed)', () => {
    const note = {
      title: 'My <b>Sample</b> Note',
      content: '<p>This&nbsp;is <b>HTML</b> content &amp; entities.</p>',
      updatedAt: '2025-10-19T12:00:00Z',
    };

    // Use renderWithProviders so MUI styles + roles are correct
    renderWithProviders(<NoteCard note={note} />);

    // Title shows without HTML
    expect(screen.getByText('My Sample Note')).toBeInTheDocument();

    // Snippet shows cleaned text, no tags/entities
    expect(
      screen.getByText(/This is HTML content & entities\./i)
    ).toBeInTheDocument();

    // UpdatedAt label is present (not asserting exact date due to locale)
    expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
  });

  test('falls back to default when title/content missing', () => {
    const note = { title: '', content: '' };
    renderWithProviders(<NoteCard note={note} />);

    // Default title
    expect(screen.getByText('Untitled Note')).toBeInTheDocument();

    // Default content message
    expect(screen.getByText(/No content available\./i)).toBeInTheDocument();
  });

  test('limits content to 10 words and adds ellipsis', () => {
    const longWords = 'one two three four five six seven eight nine ten eleven twelve';
    const note = { title: 'Truncate', content: longWords };

    renderWithProviders(<NoteCard note={note} />);

    // The visible snippet should be "one two ... ten …"
    // We just check it's 10 words + ellipsis at end.
    const snippet = screen.getByText(/one two three four five six seven eight nine ten…/i);
    expect(snippet).toBeInTheDocument();
  });

  test('fires onClick when the card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const note = { title: 'Clickable', content: 'Tap me' };

    renderWithProviders(<NoteCard note={note} onClick={handleClick} />);

    // CardActionArea renders as a button — accessible by role
    const btn = screen.getByRole('button', { name: /clickable/i });
    await user.click(btn);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not render "Last updated" when updatedAt is missing', () => {
    const note = { title: 'No date', content: 'x' };
    renderWithProviders(<NoteCard note={note} />);

    expect(screen.queryByText(/Last updated:/i)).toBeNull();
  });
});

describe('NoteCardsGrid', () => {
  test('renders N note cards and forwards clicks with the note object', async () => {
    const user = userEvent.setup();
    const notes = [
      { _id: 'n1', title: 'Alpha', content: 'hello world' },
      { _id: 'n2', title: 'Beta', content: 'this is second' },
      { _id: 'n3', title: 'Gamma', content: 'third item' },
    ];
    const onNoteClick = jest.fn();

    renderWithProviders(<NoteCardsGrid notes={notes} onNoteClick={onNoteClick} />);

    // We expect 3 clickable cards; find them by their titles (role button)
    const alphaBtn = screen.getByRole('button', { name: /alpha/i });
    const betaBtn = screen.getByRole('button', { name: /beta/i });
    const gammaBtn = screen.getByRole('button', { name: /gamma/i });

    // Click Beta
    await user.click(betaBtn);
    expect(onNoteClick).toHaveBeenCalledTimes(1);
    expect(onNoteClick).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'n2', title: 'Beta' })
    );

    // Click Alpha
    await user.click(alphaBtn);
    expect(onNoteClick).toHaveBeenCalledTimes(2);
    expect(onNoteClick).toHaveBeenLastCalledWith(
      expect.objectContaining({ _id: 'n1', title: 'Alpha' })
    );

    // Click Gamma
    await user.click(gammaBtn);
    expect(onNoteClick).toHaveBeenCalledTimes(3);
    expect(onNoteClick).toHaveBeenLastCalledWith(
      expect.objectContaining({ _id: 'n3', title: 'Gamma' })
    );
  });
});
