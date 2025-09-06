const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tauri-apps/api/core$': '<rootDir>/src/__mocks__/@tauri-apps/api.ts',
    '^@tauri-apps/plugin-dialog$': '<rootDir>/src/__mocks__/@tauri-apps/plugin-dialog.ts',
    '^@tauri-apps/plugin-fs$': '<rootDir>/src/__mocks__/@tauri-apps/plugin-fs.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react)/)',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__mocks__/**/*',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);