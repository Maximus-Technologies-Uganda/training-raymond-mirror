import { test, expect } from '@playwright/test';

/**
 * ✅ FIX 1: Real smoke test that verifies the actual UI build
 * Tests that the scaffold renders correctly with the welcome heading
 */
test('UI scaffold renders welcome heading @smoke', async ({ page }) => {
  await page.goto('/');

  // Verify the main heading is visible
  const heading = page.getByTestId('welcome-title');
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('Training Raymond UI');

  // Verify content loaded
  await expect(page.getByText(/Week 3 UI workspace/i)).toBeVisible();
});
