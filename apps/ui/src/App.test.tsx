import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the welcome headline', () => {
    render(<App />);
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('Training Raymond UI');
  });

  it('renders the introduction text', () => {
    render(<App />);
    expect(screen.getByText(/Foundations for the Expenses, ToDo, and Quote experiences/i)).toBeInTheDocument();
  });

  it('exposes all three page placeholders', () => {
    render(<App />);

    const container = screen.getByTestId('page-placeholders');
    expect(container).toBeInTheDocument();
  });

  it('renders the Expenses page section', () => {
    render(<App />);

    const heading = screen.getByRole('heading', { level: 2, name: /Expenses/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('id', 'expenses-heading');

    expect(screen.getByTestId('expenses-components-placeholder')).toBeInTheDocument();
  });

  it('renders the ToDo page section', () => {
    render(<App />);

    const heading = screen.getByRole('heading', { level: 2, name: /ToDo/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('id', 'todo-heading');

    expect(screen.getByTestId('todo-components-placeholder')).toBeInTheDocument();
  });

  it('renders the Quote page section', () => {
    render(<App />);

    const heading = screen.getByRole('heading', { level: 2, name: /Quote/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('id', 'quote-heading');

    expect(screen.getByTestId('quote-components-placeholder')).toBeInTheDocument();
  });

  it('uses proper semantic HTML structure', () => {
    render(<App />);

    // Main container has role="main"
    const main = screen.getByRole('main');
    expect(main).toHaveClass('App');

    // Each page is a section with proper aria-labelledby
    const expensesSection = screen.getByLabelText(/Expenses/i);
    expect(expensesSection.tagName).toBe('SECTION');

    const todoSection = screen.getByLabelText(/ToDo/i);
    expect(todoSection.tagName).toBe('SECTION');

    const quoteSection = screen.getByLabelText(/Quote/i);
    expect(quoteSection.tagName).toBe('SECTION');
  });

  it('applies correct CSS classes to page sections', () => {
    render(<App />);

    const sections = screen.getAllByRole('region');
    sections.forEach((section) => {
      expect(section).toHaveClass('page');
    });
  });
});
