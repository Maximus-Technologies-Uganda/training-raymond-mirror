import { test, expect } from '@playwright/test';

test.describe('Quote UI smoke tests', () => {
  test('deterministic featured quote and seed updates @smoke', async ({ page }) => {
    await page.goto('/');

    // Navigate to Quote tab with explicit wait and retry
    const quoteTab = page.getByTestId('nav-quote');
    await quoteTab.waitFor({ state: 'visible', timeout: 15000 });
    await quoteTab.click({ force: true });

    // Wait for Quote content to load
    const featured = page.getByTestId('quote-featured');
    await expect(featured).toBeVisible({ timeout: 15000 });

    // Verify default quote is displayed (check for blockquote element)
    const blockquote = featured.locator('blockquote');
    await expect(blockquote).toBeVisible();
    const quoteText = await blockquote.textContent();
    expect(quoteText).toBeTruthy(); // Ensure some quote text is present

    const seedInput = page.getByTestId('quote-seed-input');
    await seedInput.fill('seed-a');

    // Quote should change deterministically
    const quoteBefore = await featured.textContent();

    await seedInput.fill('seed-b');
    const quoteAfter = await featured.textContent();

    expect(quoteBefore).not.toBe(quoteAfter);

    // Setting seed back should restore the quote
    await seedInput.fill('seed-a');
    const quoteRestored = await featured.textContent();
    expect(quoteRestored).toBe(quoteBefore);
  });

  test('filters by author and tag with clear action @smoke', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-quote').click();

    // Verify dropdown options are populated
    const authorSelect = page.getByTestId('quote-filter-author');
    const authorOptions = await authorSelect.locator('option').allTextContents();
    expect(authorOptions).toContain('All authors');
    expect(authorOptions.length).toBeGreaterThan(1);

    // Filter by author
    await authorSelect.selectOption('Maya Angelou');

    const authorResults = page.getByTestId('quote-filtered-list');
    await expect(authorResults).toBeVisible();
    await expect(authorResults).toContainText('Still I rise.');
    await expect(authorResults).toContainText('Maya Angelou');

    // Clear filters button should be visible
    const clearButton = page.getByTestId('quote-clear-filters');
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Should return to featured quote view
    await expect(page.getByTestId('quote-featured')).toBeVisible();

    // Filter by tag
    const tagSelect = page.getByTestId('quote-filter-tag');
    const tagOptions = await tagSelect.locator('option').allTextContents();
    expect(tagOptions).toContain('All tags');
    expect(tagOptions.length).toBeGreaterThan(1);

    await tagSelect.selectOption('perseverance');
    const tagResults = page.getByTestId('quote-filtered-list');
    await expect(tagResults).toBeVisible();

    // Should show multiple results
    const listItems = tagResults.locator('li');
    const count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('displays all available authors in dropdown @smoke', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-quote').click();

    const authorSelect = page.getByTestId('quote-filter-author');
    const options = await authorSelect.locator('option').allTextContents();

    expect(options).toContain('All authors');
    expect(options).toContain('Maya Angelou');
    expect(options).toContain('Robert Frost');
    expect(options.length).toBeGreaterThan(3);
  });

  test('shows helpful empty state when no matches @smoke', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-quote').click();

    // Select author
    await page.getByTestId('quote-filter-author').selectOption('Maya Angelou');

    // Select incompatible tag
    await page.getByTestId('quote-filter-tag').selectOption('leadership');

    // Should show no results message
    const emptyState = page.getByTestId('quote-no-results');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No quotes match the current filters');

    // Should have clear action button
    const clearAction = emptyState.locator('button');
    await expect(clearAction).toBeVisible();
    await clearAction.click();

    // Should return to featured view
    await expect(page.getByTestId('quote-featured')).toBeVisible();
  });

  test('maintains accessibility attributes @smoke', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-quote').click();

    // Check ARIA labels
    const authorSelect = page.getByTestId('quote-filter-author');
    await expect(authorSelect).toHaveAttribute('aria-describedby', 'quote-author-help');

    const tagSelect = page.getByTestId('quote-filter-tag');
    await expect(tagSelect).toHaveAttribute('aria-describedby', 'quote-tag-help');

    const seedInput = page.getByTestId('quote-seed-input');
    await expect(seedInput).toHaveAttribute('aria-describedby', 'quote-seed-help');

    // Check help text is present
    await expect(page.locator('#quote-author-help')).toBeVisible();
    await expect(page.locator('#quote-tag-help')).toBeVisible();
    await expect(page.locator('#quote-seed-help')).toBeVisible();
  });
});
