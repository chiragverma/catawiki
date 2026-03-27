import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Run tests one at a time (no parallelism) */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* 2 workers lets the two test files run in parallel while respecting
     mode:'serial' within the lot describe block.
     Keep at 2 (not higher) to avoid triggering Catawiki's bot detection. */
  workers: 2,
  /* Sharding: set via --shard=x/y CLI flag or SHARD env var */
  shard: process.env.SHARD
    ? { current: parseInt(process.env.SHARD.split('/')[0]), total: parseInt(process.env.SHARD.split('/')[1]) }
    : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.SHARD ? [['blob'], ['line']] : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  /* Each test (including beforeEach) gets 2 minutes — live site navigation is slow */
  timeout: 120_000,
  use: {
    baseURL: 'https://www.catawiki.com',
    /* Generous timeouts for live external sites */
    actionTimeout: 30_000,
    navigationTimeout: 60_000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Save a screenshot on failure for easier debugging */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use the machine's installed Chrome instead of bundled Chromium so that
        // live sites with bot-detection (e.g. Akamai) see a real browser fingerprint.
        channel: 'chrome',
        headless: false,
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled'],
        },
      },
    },

    // firefox, webkit, and mobile projects disabled — running Chrome only
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // /* Mobile viewports */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //     channel: 'chrome',
    //     launchOptions: {
    //       args: ['--disable-blink-features=AutomationControlled'],
    //     },
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
});
