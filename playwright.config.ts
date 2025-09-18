import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: "./tests",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  retries: 1,
  reporter: [
    ["list"],
    ["html", { open: "never" }], //view the report with 'npm run report'
  ],
  use: {
    baseURL: process.env.BASE_URL ?? "https://app.cymulate.com",
    viewport: { width: 1920, height: 937 },
    headless: true,
    acceptDownloads: true,
    video: "on",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
