const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  use: {
    // Local tests default to the smoke-test port; deploy tests should pass BASE_URL env.
    baseURL: process.env.BASE_URL || process.env.CLAWNSOLE_BASE_URL || 'http://127.0.0.1:18888',
    trace: 'retain-on-failure'
  }
});
