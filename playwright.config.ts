import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.PLAYWRIGHT_PORT ?? "3100";
const e2eBaseURL = `http://127.0.0.1:${e2ePort}`;
const reuseExistingServer =
  process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "true";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: e2eBaseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${e2ePort}`,
    url: e2eBaseURL,
    reuseExistingServer,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /.*webkit-smoke\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1882, height: 930 },
      },
    },
    {
      name: "mobile-webkit",
      testMatch: /.*webkit-smoke\.spec\.ts/,
      use: {
        ...devices["iPhone 13"],
        browserName: "webkit",
      },
    },
  ],
});
