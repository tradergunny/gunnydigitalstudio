import { defineConfig, devices } from '@playwright/test';

/* The one test seam: the production build, served by `vite preview`, driven in a real browser.
   Desktop is 1440 wide; the phone is 390 wide with touch and a device pixel ratio of 2. */

/* Override with PORT=… when another checkout already holds 4173, since a running server on
   the port is reused as is and would serve that checkout's build instead of this one's. */
const PORT = Number(process.env.PORT) || 4173;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: { baseURL },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'phone',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
});
