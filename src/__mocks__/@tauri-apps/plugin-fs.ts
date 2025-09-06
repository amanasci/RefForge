// Mock for @tauri-apps/plugin-fs
export const writeTextFile = jest.fn();
export const readTextFile = jest.fn();

// Configure default mock implementations
writeTextFile.mockResolvedValue(undefined);
readTextFile.mockResolvedValue('mock file content');