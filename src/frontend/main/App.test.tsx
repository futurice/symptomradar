import { render } from '@testing-library/react';
import React from 'react';
import { App } from './App';

it('renders the menu button element', () => {
  const { getByText } = render(<App />);
  expect(getByText('Menu')).toBeInTheDocument();
});
