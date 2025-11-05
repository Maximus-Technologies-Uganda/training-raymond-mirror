import { type ChangeEvent, useEffect, useRef } from 'react';
import type { QuoteOption } from '../../lib/quote/view';

export interface QuoteFiltersProps {
  authorOptions: readonly QuoteOption[];
  tagOptions: readonly QuoteOption[];
  author: string | null;
  tag: string | null;
  seed: string;
  hasActiveFilters: boolean;
  onAuthorChange: (value: string | null) => void;
  onTagChange: (value: string | null) => void;
  onSeedChange: (value: string) => void;
  onClearFilters: () => void;
}

function handleSelectChange(event: ChangeEvent<HTMLSelectElement>, onChange: (value: string | null) => void): void {
  const { value } = event.target;
  onChange(value.length > 0 ? value : null);
}

export function QuoteFilters({
  authorOptions,
  tagOptions,
  author,
  tag,
  seed,
  hasActiveFilters,
  onAuthorChange,
  onTagChange,
  onSeedChange,
  onClearFilters,
}: QuoteFiltersProps): JSX.Element {
  const authorSelectRef = useRef<HTMLSelectElement>(null);

  // Keyboard shortcut: Ctrl+/ to focus author filter
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && e.ctrlKey) {
        e.preventDefault();
        authorSelectRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <section className="quote-filters" aria-label="Quote filters and controls">
      <div className="quote-filters__group">
        <label className="quote-filters__label" htmlFor="quote-author-select">
          Author
        </label>
        <select
          ref={authorSelectRef}
          id="quote-author-select"
          className="quote-filters__select"
          value={author ?? ''}
          onChange={(event) => handleSelectChange(event, onAuthorChange)}
          data-testid="quote-filter-author"
          aria-describedby="quote-author-help"
        >
          {authorOptions.map((option) => (
            <option key={option.label} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
        <p id="quote-author-help" className="quote-filters__help">
          Filter quotes by author. Press Ctrl+/ to focus.
        </p>
      </div>

      <div className="quote-filters__group">
        <label className="quote-filters__label" htmlFor="quote-tag-select">
          Tag
        </label>
        <select
          id="quote-tag-select"
          className="quote-filters__select"
          value={tag ?? ''}
          onChange={(event) => handleSelectChange(event, onTagChange)}
          data-testid="quote-filter-tag"
          aria-describedby="quote-tag-help"
        >
          {tagOptions.map((option) => (
            <option key={option.label} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
        <p id="quote-tag-help" className="quote-filters__help">
          Filter quotes by tag category.
        </p>
      </div>

      <div className="quote-filters__group">
        <label className="quote-filters__label" htmlFor="quote-seed-input">
          Random seed
        </label>
        <input
          id="quote-seed-input"
          className="quote-filters__input"
          type="text"
          value={seed}
          onChange={(event) => onSeedChange(event.target.value)}
          data-testid="quote-seed-input"
          placeholder="Enter seed (e.g. 42)"
          aria-describedby="quote-seed-help"
        />
        <p id="quote-seed-help" className="quote-filters__help">
          Using the same seed will always surface the same random quote.
        </p>
      </div>

      <div className="quote-filters__actions">
        {hasActiveFilters && (
          <button
            type="button"
            className="quote-filters__clear"
            onClick={onClearFilters}
            data-testid="quote-clear-filters"
            aria-label="Clear all active filters"
          >
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}

export default QuoteFilters;
