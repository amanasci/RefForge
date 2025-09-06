import { getSettings, setSettings, validateDb, backupDb, defaultSettings } from '@/lib/settings';

// Mock the Tauri API
jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn(),
}));

jest.mock('@tauri-apps/plugin-dialog', () => ({
  open: jest.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

const mockedInvoke = invoke as jest.MockedFunction<typeof invoke>;
const mockedOpen = open as jest.MockedFunction<typeof open>;

describe('Settings Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    test('returns settings from Tauri backend', async () => {
      const mockSettings = {
        version: 1,
        database_path: '/path/to/db.sqlite',
        theme: 'dark',
        last_verified: '2024-01-01T12:00:00Z',
        backup_enabled: true,
        max_backups: 5,
      };

      mockedInvoke.mockResolvedValue(mockSettings);

      const result = await getSettings();

      expect(mockedInvoke).toHaveBeenCalledWith('get_settings');
      expect(result).toEqual(mockSettings);
    });

    test('returns default settings on error', async () => {
      mockedInvoke.mockRejectedValue(new Error('Backend error'));

      const result = await getSettings();

      expect(result).toEqual(defaultSettings);
    });
  });

  describe('setSettings', () => {
    test('calls Tauri backend to save settings', async () => {
      const settings = {
        version: 1,
        database_path: '/new/path/db.sqlite',
        theme: 'light',
        last_verified: undefined,
        backup_enabled: false,
        max_backups: 3,
      };

      mockedInvoke.mockResolvedValue(undefined);

      await setSettings(settings);

      expect(mockedInvoke).toHaveBeenCalledWith('set_settings', { settings });
    });
  });

  describe('validateDb', () => {
    test('returns validation result from Tauri backend', async () => {
      const mockResult = {
        valid: true,
        message: 'Database is valid',
      };

      mockedInvoke.mockResolvedValue(mockResult);

      const result = await validateDb('/path/to/db.sqlite');

      expect(mockedInvoke).toHaveBeenCalledWith('validate_database', { path: '/path/to/db.sqlite' });
      expect(result).toEqual(mockResult);
    });
  });

  describe('backupDb', () => {
    test('returns backup result from Tauri backend', async () => {
      const mockResult = {
        success: true,
        backup_path: '/backup/db_20240101_120000.bak',
        message: 'Backup successful',
      };

      mockedInvoke.mockResolvedValue(mockResult);

      const result = await backupDb('/path/to/db.sqlite');

      expect(mockedInvoke).toHaveBeenCalledWith('backup_database', { path: '/path/to/db.sqlite' });
      expect(result).toEqual(mockResult);
    });
  });

  describe('chooseDbFile', () => {
    test('opens file dialog and returns selected path', async () => {
      const mockPath = '/selected/database.db';
      mockedOpen.mockResolvedValue(mockPath);

      // Need to import chooseDbFile after mocking
      const { chooseDbFile } = await import('@/lib/settings');
      const result = await chooseDbFile();

      expect(mockedOpen).toHaveBeenCalledWith({
        multiple: false,
        filters: [
          {
            name: 'SQLite Database',
            extensions: ['db', 'sqlite', 'sqlite3'],
          },
          {
            name: 'All Files',
            extensions: ['*'],
          },
        ],
      });
      expect(result).toBe(mockPath);
    });
  });
});