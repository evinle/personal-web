import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Every test gets its own browser context and only reads the built site, so they can all run at once.
  fullyParallel: true,
  globalSetup: './e2e/global-setup.mjs',
  globalTeardown: './e2e/global-teardown.mjs',
  use: {
    baseURL: 'http://localhost:4322',
  },
});
