import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npx serve out -p 9002',
    url: 'http://localhost:9002',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:9002',
  },
});
