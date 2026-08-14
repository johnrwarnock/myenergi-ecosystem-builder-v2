import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173/myenergi-ecosystem-builder-v2/',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/myenergi-ecosystem-builder-v2/',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
