const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@tauri-apps/api/core$': '<rootDir>/src/__mocks__/tauri-api.ts',
    '^@tauri-apps/api/event$': '<rootDir>/src/__mocks__/tauri-api.ts',
    '^@tauri-apps/plugin-dialog$': '<rootDir>/src/__mocks__/tauri-api.ts',
    'lucide-react': '<rootDir>/src/__mocks__/lucide-react.ts',
  },
  testPathIgnorePatterns: ['<rootDir>/tests/'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
