import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Preferences } from '../Preferences';
import { SettingsService, Settings } from '@/lib/settings';

// Mock settings service for testing
class MockSettingsService implements SettingsService {
  private settings: Settings = {
    version: 1,
    database_path: '/path/to/test.db',
    theme: 'system',
    last_verified: '2024-01-01T12:00:00Z',
    backup_enabled: true,
    max_backups: 10,
  };

  async getSettings(): Promise<Settings> {
    return Promise.resolve({ ...this.settings });
  }

  async setSettings(settings: Settings): Promise<void> {
    this.settings = { ...settings };
    return Promise.resolve();
  }

  async validateDb(path: string): Promise<{ valid: boolean; message: string }> {
    if (path === '/invalid/path') {
      return Promise.resolve({
        valid: false,
        message: 'Database file does not exist',
      });
    }
    return Promise.resolve({
      valid: true,
      message: 'Database is valid and accessible',
    });
  }

  async backupDb(path: string): Promise<{
    success: boolean;
    backup_path?: string;
    message: string;
  }> {
    return Promise.resolve({
      success: true,
      backup_path: '/backup/test_20240101_120000.bak',
      message: 'Database backed up successfully',
    });
  }

  async chooseDbFile(): Promise<string | null> {
    return Promise.resolve('/new/database/path.db');
  }
}

describe('Preferences Component', () => {
  let mockSettingsService: MockSettingsService;

  beforeEach(() => {
    mockSettingsService = new MockSettingsService();
  });

  test('loads and displays settings when opened', async () => {
    render(
      <Preferences
        open={true}
        onOpenChange={jest.fn()}
        settingsServiceProp={mockSettingsService}
      />
    );

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('/path/to/test.db')).toBeInTheDocument();
    });

    // Check that theme is displayed
    expect(screen.getByDisplayValue('System')).toBeInTheDocument();
  });

  test('validates database when Test button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Preferences
        open={true}
        onOpenChange={jest.fn()}
        settingsServiceProp={mockSettingsService}
      />
    );

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('/path/to/test.db')).toBeInTheDocument();
    });

    // Click the Test button
    const testButton = screen.getByRole('button', { name: /test/i });
    await user.click(testButton);

    // Check for validation result
    await waitFor(() => {
      expect(screen.getByText('Database is valid and accessible')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid database', async () => {
    const user = userEvent.setup();
    
    render(
      <Preferences
        open={true}
        onOpenChange={jest.fn()}
        settingsServiceProp={mockSettingsService}
      />
    );

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('/path/to/test.db')).toBeInTheDocument();
    });

    // Change database path to invalid path
    const dbInput = screen.getByDisplayValue('/path/to/test.db');
    await user.clear(dbInput);
    await user.type(dbInput, '/invalid/path');

    // Click the Test button
    const testButton = screen.getByRole('button', { name: /test/i });
    await user.click(testButton);

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Database file does not exist')).toBeInTheDocument();
    });
  });

  test('changes theme selection', async () => {
    const user = userEvent.setup();
    
    render(
      <Preferences
        open={true}
        onOpenChange={jest.fn()}
        settingsServiceProp={mockSettingsService}
      />
    );

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('System')).toBeInTheDocument();
    });

    // Open theme selector (it's implemented as a Select component)
    const themeSelect = screen.getByRole('combobox');
    await user.click(themeSelect);

    // Wait for options to appear and select Dark
    await waitFor(() => {
      const darkOption = screen.getByText('Dark');
      expect(darkOption).toBeInTheDocument();
    });

    const darkOption = screen.getByText('Dark');
    await user.click(darkOption);

    // Verify selection changed - the select should now show Dark
    await waitFor(() => {
      expect(screen.getByDisplayValue('Dark')).toBeInTheDocument();
    });
  });

  test('applies settings when Apply button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = jest.fn();
    
    render(
      <Preferences
        open={true}
        onOpenChange={mockOnOpenChange}
        settingsServiceProp={mockSettingsService}
      />
    );

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('/path/to/test.db')).toBeInTheDocument();
    });

    // Change database path
    const dbInput = screen.getByDisplayValue('/path/to/test.db');
    await user.clear(dbInput);
    await user.type(dbInput, '/new/path/database.db');

    // Click Apply button
    const applyButton = screen.getByRole('button', { name: /apply/i });
    await user.click(applyButton);

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument();
    });
  });

  test('closes dialog when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = jest.fn();
    
    render(
      <Preferences
        open={true}
        onOpenChange={mockOnOpenChange}
        settingsServiceProp={mockSettingsService}
      />
    );

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('/path/to/test.db')).toBeInTheDocument();
    });

    // Click Cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Check that onOpenChange was called with false
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  test('resets to original settings when Reset button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Preferences
        open={true}
        onOpenChange={jest.fn()}
        settingsServiceProp={mockSettingsService}
      />
    );

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('/path/to/test.db')).toBeInTheDocument();
    });

    // Change database path
    const dbInput = screen.getByDisplayValue('/path/to/test.db');
    await user.clear(dbInput);
    await user.type(dbInput, '/changed/path.db');

    // Verify change
    expect(screen.getByDisplayValue('/changed/path.db')).toBeInTheDocument();

    // Click Reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    // Verify it reset to original value
    await waitFor(() => {
      expect(screen.getByDisplayValue('/path/to/test.db')).toBeInTheDocument();
    });
  });

  test('opens file dialog when Choose button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Preferences
        open={true}
        onOpenChange={jest.fn()}
        settingsServiceProp={mockSettingsService}
      />
    );

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('/path/to/test.db')).toBeInTheDocument();
    });

    // Click Choose button
    const chooseButton = screen.getByRole('button', { name: /choose/i });
    await user.click(chooseButton);

    // The mock service returns '/new/database/path.db'
    await waitFor(() => {
      expect(screen.getByDisplayValue('/new/database/path.db')).toBeInTheDocument();
    });
  });
});