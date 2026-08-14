const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npx http-server . -p 3000 --silent',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
