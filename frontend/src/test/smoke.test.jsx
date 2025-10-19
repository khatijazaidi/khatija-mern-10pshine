import { render, screen } from '@testing-library/react';

function Hello() {
  return <h1>Hello Jest Setup</h1>;
}

test('renders text', () => {
  render(<Hello />);
  expect(screen.getByRole('heading', { name: /hello jest setup/i })).toBeInTheDocument();
});
