import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the welcome headline', () => {
    render(<App />);
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('Training Raymond UI');
  });
});
