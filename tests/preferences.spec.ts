import { test, expect } from '@playwright/test';

// Note: This test will mock Tauri API calls since we're running against the web build
test.describe('Preferences Dialog', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Tauri API calls for web testing
    await page.addInitScript(() => {
      // Mock the window.__TAURI_IPC__ flag
      (window as any).__TAURI_IPC__ = true;
      
      // Mock Tauri API invoke function
      (window as any).__TAURI__ = {
        invoke: async (command: string, args?: any) => {
          switch (command) {
            case 'get_settings':
              return {
                version: 1,
                database_path: '/path/to/refforge.db',
                theme: 'system',
                last_verified: '2024-01-01T12:00:00Z',
                backup_enabled: true,
                max_backups: 10,
              };
            case 'set_settings':
              return undefined;
            case 'validate_database':
              return {
                valid: true,
                message: 'Database is valid and accessible',
              };
            case 'backup_database':
              return {
                success: true,
                backup_path: '/backup/refforge_20240101_120000.bak',
                message: 'Database backed up successfully',
              };
            default:
              throw new Error(`Unknown command: ${command}`);
          }
        }
      };

      // Mock plugin APIs
      (window as any).__TAURI_PLUGIN_DIALOG__ = {
        open: async (options?: any) => '/selected/database/path.db'
      };
    });
  });

  test('opens preferences dialog and displays settings', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await expect(page.getByRole('heading', { name: 'All References' })).toBeVisible();

    // Click the settings icon to open preferences
    await page.getByRole('button', { name: 'Open Preferences' }).click();

    // Wait for preferences dialog to open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Preferences' })).toBeVisible();

    // Check that settings tabs are present
    await expect(page.getByRole('tab', { name: 'Database' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Appearance' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'General' })).toBeVisible();

    // Check database path is loaded
    await expect(page.getByDisplayValue('/path/to/refforge.db')).toBeVisible();
  });

  test('validates database when Test button is clicked', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await expect(page.getByRole('heading', { name: 'All References' })).toBeVisible();

    // Open preferences dialog
    await page.getByRole('button', { name: 'Open Preferences' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click the Test button
    await page.getByRole('button', { name: /test/i }).click();

    // Check for validation success message
    await expect(page.getByText('Database is valid and accessible')).toBeVisible();
  });

  test('changes theme and applies settings', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await expect(page.getByRole('heading', { name: 'All References' })).toBeVisible();

    // Open preferences dialog
    await page.getByRole('button', { name: 'Open Preferences' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Switch to Appearance tab
    await page.getByRole('tab', { name: 'Appearance' }).click();

    // Change theme to Dark
    await page.getByRole('combobox').click();
    await page.getByText('Dark').click();

    // Click Apply
    await page.getByRole('button', { name: /apply/i }).click();

    // Check for success message
    await expect(page.getByText('Settings saved successfully!')).toBeVisible();
  });

  test('cancels changes and closes dialog', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await expect(page.getByRole('heading', { name: 'All References' })).toBeVisible();

    // Open preferences dialog
    await page.getByRole('button', { name: 'Open Preferences' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Make a change to the database path
    const dbInput = page.getByDisplayValue('/path/to/refforge.db');
    await dbInput.clear();
    await dbInput.fill('/changed/path.db');

    // Click Cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('resets settings to original values', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await expect(page.getByRole('heading', { name: 'All References' })).toBeVisible();

    // Open preferences dialog
    await page.getByRole('button', { name: 'Open Preferences' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Make a change to the database path
    const dbInput = page.getByDisplayValue('/path/to/refforge.db');
    await dbInput.clear();
    await dbInput.fill('/changed/path.db');

    // Verify the change
    await expect(page.getByDisplayValue('/changed/path.db')).toBeVisible();

    // Click Reset
    await page.getByRole('button', { name: /reset/i }).click();

    // Verify it reset to original value
    await expect(page.getByDisplayValue('/path/to/refforge.db')).toBeVisible();
  });
});