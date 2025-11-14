import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_CSV_PATH = path.join(__dirname, '../fixtures/expenses-sample.csv');
const QUOTED_CSV_PATH = path.join(__dirname, '../fixtures/expenses-quoted.csv');

/**
 * Helper to upload CSV file
 */
async function uploadExpensesCsv(page: Page, filePath: string): Promise<void> {
  await page.getByLabel('Upload expenses CSV').setInputFiles(filePath);
}

/**
 * Expenses CSV import smoke tests
 * Verifies upload flow, RFC 4180 compliance, filtering, totals calculation, and inline issues.
 */
test.describe('Expenses CSV Upload and Filtering', () => {
  test('requires upload before filters are enabled @smoke', async ({ page }) => {
    await page.goto('/');

    const title = page.getByTestId('expenses-title');
    await expect(title).toHaveText('Expenses overview');

    // Filters should be disabled before upload
    await expect(page.getByLabel('Month')).toBeDisabled();
    await expect(page.getByLabel('Category')).toBeDisabled();

    // Empty state messages
    await expect(page.getByTestId('expenses-empty-state')).toHaveText(/Upload a CSV file to see totals/);
    await expect(page.getByTestId('expenses-empty-row')).toHaveText(/Upload a CSV to view expenses/);
  });

  test('uploads CSV and filters update totals correctly @smoke', async ({ page }) => {
    await page.goto('/');

    await uploadExpensesCsv(page, SAMPLE_CSV_PATH);

    // Verify upload success
    await expect(page.getByTestId('expenses-upload-meta')).toContainText('Loaded 7 valid rows');
    await expect(page.getByTestId('expenses-total')).toHaveText('Total: $254.45');

    // Filters should be enabled
    await expect(page.getByLabel('Month')).not.toBeDisabled();
    await expect(page.getByLabel('Category')).not.toBeDisabled();

    // Apply month filter
    await page.getByLabel('Month').selectOption('February');
    await expect(page.getByTestId('expenses-total')).toHaveText('Total: $142.11');

    // Apply category filter
    await page.getByLabel('Category').selectOption('Groceries');
    await expect(page.getByTestId('expenses-total')).toHaveText('Total: $42.10');

    // Filter combination with no matches
    await page.getByLabel('Month').selectOption('March');
    await page.getByLabel('Category').selectOption('Utilities');
    await expect(page.getByTestId('expenses-error')).toHaveText(
      'No expenses found for the selected filters. Try a different month or category.',
    );
  });

  test('handles RFC 4180 quoted fields correctly @smoke', async ({ page }) => {
    await page.goto('/');

    await uploadExpensesCsv(page, QUOTED_CSV_PATH);

    // Verify upload success with quoted fields
    await expect(page.getByTestId('expenses-upload-meta')).toContainText('Loaded 5 valid rows');
    await expect(page.getByTestId('expenses-total')).toHaveText('Total: $122.49');

    // Verify no validation issues (quoted fields parsed correctly)
    await expect(page.getByTestId('expenses-issues')).not.toBeVisible();

    // Verify categories with special characters are available
    const categorySelect = page.getByLabel('Category');
    await categorySelect.selectOption({ label: 'Café' });
    await expect(page.getByTestId('expenses-total')).toHaveText('Total: $25.00');
  });

  test('clear filters button resets state @smoke', async ({ page }) => {
    await page.goto('/');

    await uploadExpensesCsv(page, SAMPLE_CSV_PATH);

    await expect(page.getByTestId('expenses-total')).toHaveText('Total: $254.45');

    // Initially no clear button
    await expect(page.getByRole('button', { name: /Clear all filters/i })).not.toBeVisible();

    // Apply filters
    const monthSelect = page.getByLabel('Month');
    const categorySelect = page.getByLabel('Category');

    await monthSelect.selectOption('February');
    await categorySelect.selectOption('Travel');

    // Clear button should appear
    const clearButton = page.getByRole('button', { name: /Clear all filters/i });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Filters should reset and totals should return to full dataset
    await expect(page.getByTestId('expenses-total')).toHaveText('Total: $254.45');
    await expect(clearButton).not.toBeVisible();
  });

  test('data quality notices display after upload @smoke', async ({ page }) => {
    await page.goto('/');

    await uploadExpensesCsv(page, SAMPLE_CSV_PATH);

    const issues = page.getByTestId('expenses-issues');
    await expect(issues).toBeVisible();
    await expect(issues.getByText(/Data quality notices/i)).toBeVisible();

    // Verify specific row errors are displayed
    await expect(issues.getByText(/Row 9/)).toBeVisible();
    await expect(issues.getByText(/Row 10/)).toBeVisible();
  });

  test('shows error for invalid CSV files @smoke', async ({ page }) => {
    await page.goto('/');

    // Create a CSV with too few rows
    const invalidCsv = 'date,category,amount\n2025-01-01,Test,10\n2025-01-02,Test,20';
    const buffer = Buffer.from(invalidCsv);

    await page.getByLabel('Upload expenses CSV').setInputFiles({
      name: 'invalid.csv',
      mimeType: 'text/csv',
      buffer,
    });

    // Should show error message
    await expect(page.getByTestId('expenses-upload-error')).toContainText('between 5 and 200');

    // Filters should remain disabled
    await expect(page.getByLabel('Month')).toBeDisabled();
    await expect(page.getByLabel('Category')).toBeDisabled();
  });

  test('deterministic rounding displays correctly @smoke', async ({ page }) => {
    await page.goto('/');

    await uploadExpensesCsv(page, SAMPLE_CSV_PATH);

    // Verify total with deterministic rounding (10.005 → 10.01, 12.345 → 12.35)
    await expect(page.getByTestId('expenses-total')).toHaveText('Total: $254.45');

    // Filter to show Travel (10.005 should round to $10.01)
    await page.getByLabel('Category').selectOption('Travel');
    await expect(page.getByTestId('expenses-total')).toHaveText('Total: $10.01');

    // Filter to show Café (12.345 should round to $12.35)
    await page.getByLabel('Category').selectOption('Café');
    await expect(page.getByTestId('expenses-total')).toHaveText('Total: $12.35');
  });
});
