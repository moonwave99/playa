import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./e2e-tests",
  maxFailures: 2,
  workers: 1,
  globalSetup: require.resolve("./e2e-tests/global.setup.ts"),
  globalTeardown: require.resolve("./e2e-tests/global.teardown.ts"),
};

export default config;
