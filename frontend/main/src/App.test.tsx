import React from 'react';
import { render } from '@testing-library/react';
import { App } from './App';

test('renders Sivusto päivittyy pian text', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Sivusto päivittyy pian/i);
  expect(linkElement).toBeInTheDocument();
});
