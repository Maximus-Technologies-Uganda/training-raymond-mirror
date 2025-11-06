/**
 * ToDo UI Smoke Tests
 *
 * End-to-end validation of critical user workflows:
 * - Navigation to ToDo page
 * - Adding a new task
 * - Viewing task in list
 * - Marking task complete
 * - Verifying success feedback
 *
 * These tests verify the full stack integration including:
 * - React rendering
 * - CLI business logic integration
 * - DOM manipulation
 * - User interactions
 *
 * @smoke - Critical path tests that must pass before deployment
 */

import { test, expect } from '@playwright/test';

test.describe('ToDo UI smoke tests', () => {
  /**
   * Critical workflow: Add → List → Complete
   *
   * Validates the most common user journey through the todo system.
   * If this test fails, the core functionality is broken.
   */
  test('add, list, and complete a task @smoke', async ({ page }) => {
    // Navigate to application
    await page.goto('/');

    // Navigate to ToDo tool
    await page.getByTestId('nav-todo').click();
    await expect(page.getByTestId('todo-title')).toHaveText('Team ToDo tracker');

    // Add a new task
    await page.getByTestId('todo-title-input').fill('Document API changes');
    await page.getByTestId('todo-priority-select').selectOption('high');
    await page.getByTestId('todo-due-date-input').fill('2025-11-05');
    await page.getByTestId('todo-submit').click();

    // Verify success feedback
    await expect(page.getByTestId('todo-success')).toContainText('Added "Document API changes"');
    await expect(page.getByTestId('todo-success')).toContainText('#5'); // Next ID

    // Verify task appears in list
    const newItem = page.getByTestId('todo-item-5');
    await expect(newItem).toBeVisible();
    await expect(newItem).toContainText('Document API changes');
    await expect(newItem).toContainText('HIGH');

    // Complete the task
    await newItem.getByRole('button', { name: /Mark.*complete/i }).click();

    // Verify completion
    await expect(page.getByTestId('todo-success')).toContainText(
      'Marked "Document API changes" as complete.'
    );
    await expect(page.getByTestId('todo-status-5')).toHaveText('Completed');

    // Verify button is disabled
    const completeButton = newItem.getByRole('button', { name: /Done/i });
    await expect(completeButton).toBeDisabled();
  });

  /**
   * Validates navigation between tools works correctly
   */
  test('navigation between Expenses and ToDo @smoke', async ({ page }) => {
    await page.goto('/');

    // Start on Expenses (default)
    await expect(page.getByRole('heading', { level: 1, name: /Expenses/i })).toBeVisible();

    // Navigate to ToDo
    await page.getByTestId('nav-todo').click();
    await expect(page.getByTestId('todo-title')).toBeVisible();

    // Navigate back to Expenses
    await page.getByTestId('nav-expenses').click();
    await expect(page.getByRole('heading', { level: 1, name: /Expenses/i })).toBeVisible();
  });

  /**
   * Validates that duplicate prevention works in the UI
   */
  test('prevents adding duplicate task titles @smoke', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-todo').click();

    // Try to add a task with existing title
    await page.getByTestId('todo-title-input').fill('Prepare sprint review deck');
    await page.getByTestId('todo-submit').click();

    // Verify error feedback
    await expect(page.getByTestId('todo-error')).toContainText(
      'A todo with the same title already exists.'
    );

    // Verify success message is NOT shown
    await expect(page.getByTestId('todo-success')).not.toBeVisible();
  });

  /**
   * Validates completing a task by ID
   */
  test('complete task by ID form @smoke', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-todo').click();

    // Complete task 1 using the form
    await page.getByTestId('todo-complete-input').fill('1');
    await page.getByTestId('todo-complete-submit').click();

    // Verify success
    await expect(page.getByTestId('todo-success')).toContainText(
      'Marked "Prepare sprint review deck" as complete.'
    );

    // Verify status updated
    await expect(page.getByTestId('todo-status-1')).toHaveText('Completed');

    // Verify input cleared
    await expect(page.getByTestId('todo-complete-input')).toHaveValue('');
  });

  /**
   * Validates filtering functionality
   */
  test('filter tasks by priority @smoke', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-todo').click();

    // Initially all tasks visible
    await expect(page.getByTestId('todo-item-1')).toBeVisible();
    await expect(page.getByTestId('todo-item-2')).toBeVisible();
    await expect(page.getByTestId('todo-item-3')).toBeVisible();

    // Filter to high priority
    await page.getByTestId('todo-filter-priority').selectOption('high');

    // Only task 1 should be visible
    await expect(page.getByTestId('todo-item-1')).toBeVisible();
    await expect(page.getByTestId('todo-item-2')).not.toBeVisible();
    await expect(page.getByTestId('todo-item-3')).not.toBeVisible();

    // Reset filter
    await page.getByTestId('todo-filter-priority').selectOption('all');

    // All tasks visible again
    await expect(page.getByTestId('todo-item-1')).toBeVisible();
    await expect(page.getByTestId('todo-item-2')).toBeVisible();
    await expect(page.getByTestId('todo-item-3')).toBeVisible();
  });

  /**
   * Validates summary metrics update correctly
   */
  test('summary metrics update on actions @smoke', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-todo').click();

    // Check initial metrics
    await expect(page.getByTestId('todo-summary-total')).toHaveText('4');
    await expect(page.getByTestId('todo-summary-pending')).toHaveText('3');
    await expect(page.getByTestId('todo-summary-completed')).toHaveText('1');

    // Add a new task
    await page.getByTestId('todo-title-input').fill('Test metrics update');
    await page.getByTestId('todo-submit').click();

    // Metrics should update
    await expect(page.getByTestId('todo-summary-total')).toHaveText('5');
    await expect(page.getByTestId('todo-summary-pending')).toHaveText('4');

    // Complete a task
    const task = page.getByTestId('todo-item-1');
    await task.getByRole('button', { name: /Mark.*complete/i }).click();

    // Metrics should update again
    await expect(page.getByTestId('todo-summary-pending')).toHaveText('3');
    await expect(page.getByTestId('todo-summary-completed')).toHaveText('2');
  });

  /**
   * Validates accessibility features
   */
  test('keyboard navigation works correctly @smoke @a11y', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-todo').click();

    // Tab to title input
    await page.keyboard.press('Tab');
    const titleInput = page.getByTestId('todo-title-input');
    await expect(titleInput).toBeFocused();

    // Type a title
    await page.keyboard.type('Keyboard nav test');

    // Tab through priority and date
    await page.keyboard.press('Tab'); // Priority
    await page.keyboard.press('Tab'); // Due date

    // Tab to submit button and press Enter
    await page.keyboard.press('Tab');
    const submitButton = page.getByTestId('todo-submit');
    await expect(submitButton).toBeFocused();
    await page.keyboard.press('Enter');

    // Verify task added
    await expect(page.getByTestId('todo-success')).toContainText('Keyboard nav test');
  });
});
