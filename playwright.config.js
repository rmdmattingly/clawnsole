const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  // Only run Playwright E2E specs; unit tests live under tests/unit but are run via node --test.
  testMatch: ['**/*.spec.js', '**/*.e2e.spec.js'],
  testIgnore: ['**/unit/**'],
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  use: {
    // Local tests default to the smoke-test port; deploy tests should pass BASE_URL env.
    baseURL: process.env.BASE_URL || process.env.CLAWNSOLE_BASE_URL || 'http://127.0.0.1:18888',

    // Make failures debuggable both locally and in CI.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});
