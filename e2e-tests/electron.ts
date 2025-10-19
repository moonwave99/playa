/* eslint-disable no-empty-pattern */
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";
import { _electron as electron, ElectronApplication } from "playwright";
import { test } from "playwright/test";
import { seed, removeDb } from "../src/test/seed";

const latestBuild = findLatestBuild();
const appInfo = parseElectronApp(latestBuild);

process.env.CI = "e2e";

export function setupElectron() {
  let electronApp: ElectronApplication;

  test.beforeAll(async ({}, { testId }) => {
    await seed(testId);

    electronApp = await electron.launch({
      args: [appInfo.main],
      executablePath: appInfo.executable,
      env: {
        ...process.env,
        testId,
      },
    });

    electronApp.on("window", (page) => {
      const filename = page.url()?.split("/").at(-1);
      console.log(`Window opened: ${filename}`);
      page.on("pageerror", console.error);
      page.on("console", (msg) => console.log(msg.text()));
    });
  });

  test.afterEach(async () => {
    const page = await electronApp.firstWindow();
    await page.evaluate(() => window.localStorage.clear());
  });

  test.afterAll(async ({}, { testId }) => {
    await electronApp.close();
    await removeDb(testId);
  });

  return () => electronApp;
}
