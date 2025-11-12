import { type ChangeEvent, useEffect, useRef, type RefObject } from 'react';
import type { QuoteOption } from '../../lib/quote/view';

export interface QuoteFiltersProps {
  authorOptions: readonly QuoteOption[];
  tagOptions: readonly QuoteOption[];
  author: string | null;
  tag: string | null;
  seed: string;
  hasActiveFilters: boolean;
  authorInputRef?: RefObject<HTMLInputElement>;
  onAuthorChange: (value: string | null) => void;
  onTagChange: (value: string | null) => void;
  onSeedChange: (value: string) => void;
  onClearFilters: () => void;
}

/**
 * Type guard to filter out "All authors" placeholder from datalist suggestions.
 * Only includes options with non-empty string values for autocomplete.
 */
function isSuggestionOption(option: QuoteOption): option is QuoteOption & { value: string } {
  return typeof option.value === 'string' && option.value.trim().length > 0;
}

function handleSelectChange(event: ChangeEvent<HTMLSelectElement>, onChange: (value: string | null) => void): void {
  const { value } = event.target;
  const normalized = value.trim();
  onChange(normalized.length > 0 ? normalized : null);
}

export function QuoteFilters({
  authorOptions,
  tagOptions,
  author,
  tag,
  seed,
  hasActiveFilters,
  authorInputRef,
  onAuthorChange,
  onTagChange,
  onSeedChange,
  onClearFilters,
}: QuoteFiltersProps): JSX.Element {
  // Use provided ref or create fallback ref for internal use
  const fallbackAuthorRef = useRef<HTMLInputElement>(null);
  const resolvedAuthorRef = authorInputRef ?? fallbackAuthorRef;

  // Keyboard shortcut: Ctrl+/ to focus author filter
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && e.ctrlKey) {
        e.preventDefault();
        resolvedAuthorRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [resolvedAuthorRef]);

  const handleClearClick = (): void => {
    onClearFilters();
    resolvedAuthorRef.current?.focus();
  };

  return (
    <section className="quote-filters" aria-label="Quote filters and controls">
      <div className="quote-filters__group">
        <label className="quote-filters__label" htmlFor="quote-author-input">
          Author
        </label>
        <input
          ref={resolvedAuthorRef}
          id="quote-author-input"
          className="quote-filters__input"
          type="text"
          value={author ?? ''}
          onChange={(event) => onAuthorChange(event.target.value.length > 0 ? event.target.value : null)}
          data-testid="quote-filter-author"
          aria-describedby="quote-author-help"
          list="quote-author-options"
          placeholder="Type an author name"
          autoComplete="off"
        />
        <datalist id="quote-author-options" data-testid="quote-author-options">
          {authorOptions.filter(isSuggestionOption).map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </datalist>
        <p id="quote-author-help" className="quote-filters__help">
          Filter quotes by author (case-insensitive). Press Ctrl+/ to focus.
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
            onClick={handleClearClick}
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
