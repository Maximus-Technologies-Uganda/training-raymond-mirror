import { test, expect } from '@playwright/test';

/**
 * Phase 3 Expenses UI smoke tests
 * Verifies filtering, totals calculation, and error handling
 */
test('expenses filters update totals @smoke', async ({ page }) => {
  await page.goto('/');

  const title = page.getByTestId('expenses-title');
  await expect(title).toHaveText('Expenses overview');

  const total = page.getByTestId('expenses-total');
  await expect(total).toHaveText('Total: $232.10');

  await page.getByLabel('Month').selectOption('February');
  await expect(page.getByTestId('expenses-total')).toHaveText('Total: $132.10');

  await page.getByLabel('Category').selectOption('Utilities');
  await expect(page.getByTestId('expenses-total')).toHaveText('Total: $90.00');

  await page.getByLabel('Month').selectOption('January');
  await expect(page.getByTestId('expenses-error')).toHaveText(
    'No expenses found for the selected filters. Try a different month or category.',
  );
});

test('clear filters button functionality @smoke', async ({ page }) => {
  await page.goto('/');

  // Initially no clear button
  await expect(page.getByRole('button', { name: /Clear all filters/i })).not.toBeVisible();

  // Apply filters
  await page.getByLabel('Month').selectOption('February');
  await page.getByLabel('Category').selectOption('Groceries');

  // Clear button should appear and work
  const clearButton = page.getByRole('button', { name: /Clear all filters/i });
  await expect(clearButton).toBeVisible();
  await clearButton.click();

  // Filters should reset
  await expect(page.getByTestId('expenses-total')).toHaveText('Total: $232.10');
  await expect(clearButton).not.toBeVisible();
});

test('data quality notices display @smoke', async ({ page }) => {
  await page.goto('/');

  const issues = page.getByTestId('expenses-issues');
  await expect(issues).toBeVisible();
  await expect(issues.getByText(/Data quality notices/i)).toBeVisible();
});
