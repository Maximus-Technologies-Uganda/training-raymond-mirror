import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the expenses overview page', () => {
    render(<App />);
    expect(screen.getByTestId('expenses-title')).toHaveTextContent('Expenses overview');
    expect(screen.getByTestId('expenses-total')).toHaveTextContent(/Total:\s*\$232\.10/);
  });

  it('displays data quality notices for malformed rows', () => {
    render(<App />);
    expect(screen.getByTestId('expenses-issues')).toBeInTheDocument();
    expect(screen.getByText(/Data quality notices/i)).toBeInTheDocument();
  });

  it('renders filter controls', () => {
    render(<App />);
    expect(screen.getByLabelText(/Filter expenses by month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter expenses by category/i)).toBeInTheDocument();
  });

  it('renders the totals summary section', () => {
    render(<App />);
    expect(screen.getByText(/By category/i)).toBeInTheDocument();
    expect(screen.getByTestId('expenses-total')).toBeInTheDocument();
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
});
