// Mock for @tauri-apps/plugin-dialog
export const open = jest.fn();

// Configure default mock implementation
open.mockImplementation((options?: any) => {
  // Simulate selecting a database file
  return Promise.resolve('/path/to/test/database.db');
});