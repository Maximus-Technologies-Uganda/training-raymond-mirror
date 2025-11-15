/**
 * Accessibility Smoke Tests
 *
 * Validates WCAG compliance using axe-core across all pages.
 * These tests ensure keyboard navigation, ARIA attributes, and color contrast meet standards.
 *
 * @smoke @a11y
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility compliance @smoke @a11y', () => {
  test('Expenses page has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully interactive
    await page.getByTestId('expenses-title').waitFor({ state: 'visible' });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('ToDo page has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('nav-todo').click();
    await page.getByTestId('todo-title').waitFor({ state: 'visible' });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Quote page has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('nav-quote').click();
    await page.getByTestId('quote-featured').waitFor({ state: 'visible' });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Expenses page with uploaded CSV has no violations', async ({ page }) => {
    await page.goto('/');

    // Upload CSV
    const csvContent = `date,category,amount
2025-01-01,Groceries,10
2025-01-02,Transport,20
2025-01-03,Utilities,30
2025-01-04,Entertainment,40
2025-01-05,Travel,50`;

    await page.locator('#expenses-csv').setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    await page.getByTestId('expenses-upload-meta').waitFor({ state: 'visible' });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('ToDo page with task added has no violations', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-todo').click();

    // Add a task
    await page.getByTestId('todo-title-input').fill('Test task');
    await page.getByTestId('todo-submit').click();

    await page.getByTestId('todo-success').waitFor({ state: 'visible' });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
