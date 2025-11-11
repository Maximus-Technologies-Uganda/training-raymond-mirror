import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the expenses overview page in empty state', () => {
    render(<App />);
    expect(screen.getByTestId('expenses-title')).toHaveTextContent('Expenses overview');
    // In empty state, shows empty message instead of total
    expect(screen.getByTestId('expenses-empty-state')).toHaveTextContent(/Upload a CSV file to see totals/);
  });

  it('shows upload section and disabled filters before upload', () => {
    render(<App />);
    const uploadInput = screen.getByLabelText(/Upload expenses CSV/i, { selector: 'input' });
    expect(uploadInput).toBeInTheDocument();
    // Filters should be disabled until CSV is uploaded
    expect(screen.getByLabelText(/Filter expenses by month/i)).toBeDisabled();
    expect(screen.getByLabelText(/Filter expenses by category/i)).toBeDisabled();
  });

  it('renders filter controls', () => {
    render(<App />);
    expect(screen.getByLabelText(/Filter expenses by month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter expenses by category/i)).toBeInTheDocument();
  });

  it('renders the totals summary section', () => {
    render(<App />);
    const summaryHeading = screen.getByRole('heading', { name: /^Totals$/i });
    expect(summaryHeading).toBeInTheDocument();
    // In empty state, shows empty state message
    expect(screen.getByTestId('expenses-empty-state')).toBeInTheDocument();
  });

  it('renders the expenses table', () => {
    render(<App />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Check for table headers
    expect(screen.getByRole('columnheader', { name: /Date/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Category/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Amount/i })).toBeInTheDocument();
  });

  it('navigates to the quote explorer when requested', () => {
    render(<App />);
    const quoteButton = screen.getByTestId('nav-quote');
    fireEvent.click(quoteButton);

    expect(screen.getByRole('heading', { name: /quote explorer/i })).toBeInTheDocument();
    expect(screen.getByTestId('quote-page')).toBeInTheDocument();
    expect(screen.getByTestId('quote-filter-author')).toBeInTheDocument();
    expect(screen.getByTestId('quote-filter-tag')).toBeInTheDocument();
    expect(screen.getByTestId('quote-seed-input')).toBeInTheDocument();
  });
});
