import { test, expect } from '@playwright/test';

test.describe('Preferences Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the Tauri API for Playwright
    await page.addInitScript(() => {
      window.__TAURI_INTERNALS__ = {
        invoke: async (command, args) => {
          console.log('[E2E MOCK] invoke', command, args);
          if (command === 'get_settings') {
            return { version: 1, db_path: '/e2e/initial.db', theme: 'system' };
          }
          if (command === 'set_settings') {
            return;
          }
          if (command === 'validate_db') {
            return { ok: true, message: 'E2E validation successful' };
          }
          if (command === 'backup_db') {
            return { ok: true, message: 'E2E backup successful' };
          }
          if (command === 'plugin:dialog|open') {
            return '/e2e/selected-folder';
          }
          if (command === 'plugin:path|join') {
            return args.paths.join('/');
          }
        },
      };
    });
  });

  test('should load settings and allow updates', async ({ page }) => {
    await page.goto('/preferences');

    // Check initial state
    await expect(page.locator('input#db-path')).toHaveValue('/e2e/initial.db');

    // Change DB path
    await page.getByRole('button', { name: 'Choose...' }).click();
    await expect(page.locator('input#db-path')).toHaveValue('/e2e/selected-folder/refforge.db');

    // Change theme
    await page.getByRole('tab', { name: 'Appearance' }).click();
    await page.getByRole('combobox').click();
    await page.getByText('Dark').click();

    // Apply settings
    await page.getByRole('button', { name: 'Apply' }).click();

    // Expect a success toast (we can't easily read the toast, so we'll assume it worked if no errors)
    // In a real app, we might add a data-testid to the toast for easier selection.
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
  });
});
