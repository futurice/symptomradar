import { render } from '@testing-library/react';
import React from 'react';
import { AppPlaceholder } from './AppPlaceholder';

test('renders Sivusto päivittyy pian text', () => {
  const { getByText } = render(<AppPlaceholder />);
  const linkElement = getByText(/Sivusto päivittyy pian/i);
  expect(linkElement).toBeInTheDocument();
});
