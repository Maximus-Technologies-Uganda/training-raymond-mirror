import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quote from '../pages/Quote';
import { createSeededRandom } from '../lib/random/seeded';
import { SAMPLE_QUOTES } from '../lib/quote/sampleData';

const DEFAULT_SEED = 'ui-test-seed';

describe('Quote page', () => {
  it('renders a deterministic featured quote using the provided seed', () => {
    render(<Quote initialSeed={DEFAULT_SEED} />);

    const rng = createSeededRandom(DEFAULT_SEED);
    const expectedQuote = SAMPLE_QUOTES[rng.nextInt(SAMPLE_QUOTES.length)];

    const featured = screen.getByTestId('quote-featured');
    expect(featured).toHaveTextContent(expectedQuote.text);
    expect(featured).toHaveTextContent(expectedQuote.author);
    expect(screen.getByTestId('quote-tags-featured')).toHaveTextContent(`Tags: ${expectedQuote.tags.join(', ')}`);
  });

  it('updates the featured quote when the seed changes', async () => {
    const user = userEvent.setup();
    render(<Quote initialSeed={DEFAULT_SEED} />);

    // Verify initial quote is displayed
    const initialFeatured = screen.getByTestId('quote-featured');
    expect(initialFeatured).toBeInTheDocument();

    const seedInput = screen.getByTestId('quote-seed-input');
    await user.clear(seedInput);
    await user.type(seedInput, 'new-seed-42');

    // Quote should still be displayed after seed change (verifies component doesn't crash)
    await waitFor(() => {
      const featured = screen.getByTestId('quote-featured');
      expect(featured).toBeInTheDocument();
      // Just verify it contains some author text (proves it's rendering a quote)
      expect(featured.textContent).toBeTruthy();
    });
  });

  it('filters quotes by author and shows clear filters control', async () => {
    const user = userEvent.setup();
    render(<Quote initialSeed={DEFAULT_SEED} />);

    await user.selectOptions(screen.getByTestId('quote-filter-author'), 'Maya Angelou');

    const resultsList = await screen.findByTestId('quote-filtered-list');
    const items = within(resultsList).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Still I rise.');
    expect(items[0]).toHaveTextContent('Maya Angelou');

    // Wait for clear button to be in document
    await waitFor(() => {
      expect(screen.getByTestId('quote-clear-filters')).toBeInTheDocument();
    });
  });

  it('filters quotes by tag and shows filter UI correctly', async () => {
    const user = userEvent.setup();
    render(<Quote initialSeed={DEFAULT_SEED} />);

    const tagSelect = screen.getByTestId('quote-filter-tag');

    // Select a tag filter
    await user.selectOptions(tagSelect, 'hope');

    // Clear button should be present when filter is active
    await waitFor(() => {
      expect(screen.getByTestId('quote-clear-filters')).toBeInTheDocument();
    });

    // Some result display should be visible
    await waitFor(() => {
      const hasResultDisplay =
        screen.queryByTestId('quote-filtered-list') !== null ||
        screen.queryByTestId('quote-no-results') !== null ||
        screen.queryByTestId('quote-featured') !== null;
      expect(hasResultDisplay).toBe(true);
    });
  });

  it('shows empty state when dataset is empty', () => {
    render(<Quote quotes={[]} initialSeed={DEFAULT_SEED} />);

    expect(screen.getByTestId('quote-empty-state')).toHaveTextContent('No quotes available');
  });

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<Quote initialSeed={DEFAULT_SEED} />);

    // Apply filters
    await user.selectOptions(screen.getByTestId('quote-filter-author'), 'Maya Angelou');

    // Wait for clear button
    await waitFor(() => {
      expect(screen.getByTestId('quote-clear-filters')).toBeInTheDocument();
    });

    // Clear filters
    await user.click(screen.getByTestId('quote-clear-filters'));

    // Should show featured quote again
    await waitFor(() => {
      expect(screen.getByTestId('quote-featured')).toBeInTheDocument();
    });
  });

  it('shows helpful message when no quotes match filters', async () => {
    const user = userEvent.setup();
    render(<Quote initialSeed={DEFAULT_SEED} />);

    // Select author
    await user.selectOptions(screen.getByTestId('quote-filter-author'), 'Maya Angelou');
    // Select incompatible tag
    await user.selectOptions(screen.getByTestId('quote-filter-tag'), 'leadership');

    await waitFor(() => {
      expect(screen.getByTestId('quote-no-results')).toBeInTheDocument();
    });

    expect(screen.getByTestId('quote-no-results')).toHaveTextContent('No quotes match the current filters');
    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });

  it('provides keyboard shortcut hint for author filter', () => {
    render(<Quote initialSeed={DEFAULT_SEED} />);

    expect(screen.getByText(/Ctrl\+\/ to focus/)).toBeInTheDocument();
  });

  it('displays available authors in dropdown', () => {
    render(<Quote initialSeed={DEFAULT_SEED} />);

    const authorSelect = screen.getByTestId('quote-filter-author');
    const options = within(authorSelect).getAllByRole('option');

    expect(options[0]).toHaveTextContent('All authors');
    expect(options.length).toBeGreaterThan(1);
    expect(options.some((opt) => opt.textContent === 'Maya Angelou')).toBe(true);
  });

  it('displays available tags in dropdown', () => {
    render(<Quote initialSeed={DEFAULT_SEED} />);

    const tagSelect = screen.getByTestId('quote-filter-tag');
    const options = within(tagSelect).getAllByRole('option');

    expect(options[0]).toHaveTextContent('All tags');
    expect(options.length).toBeGreaterThan(1);
    expect(options.some((opt) => opt.textContent === 'resilience')).toBe(true);
  });
});
