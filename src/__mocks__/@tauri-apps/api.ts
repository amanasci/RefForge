// Mock for @tauri-apps/api/core
export const invoke = jest.fn();

// Mock settings responses
const mockSettings = {
  version: 1,
  database_path: 'refforge.db',
  theme: 'system',
  last_verified: null,
  backup_enabled: true,
  max_backups: 10,
};

// Configure default mock implementations
invoke.mockImplementation((command: string, args?: any) => {
  switch (command) {
    case 'get_settings':
      return Promise.resolve(mockSettings);
    case 'set_settings':
      return Promise.resolve();
    case 'validate_database':
      return Promise.resolve({
        valid: true,
        message: 'Database is valid and accessible',
      });
    case 'backup_database':
      return Promise.resolve({
        success: true,
        backup_path: '/path/to/backup/refforge_20240101_120000.bak',
        message: 'Database backed up successfully',
      });
    default:
      return Promise.reject(new Error(`Unknown command: ${command}`));
  }
});

// Mock event system
export const event = {
  listen: jest.fn().mockResolvedValue(jest.fn()), // Returns unsubscribe function
  emit: jest.fn().mockResolvedValue(undefined),
};