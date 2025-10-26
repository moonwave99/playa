/* eslint-disable no-empty-pattern */
import {
  findLatestBuild,
  parseElectronApp,
  clickMenuItemById,
} from "electron-playwright-helpers";

import {
  _electron as electron,
  ElectronApplication,
  type Page,
} from "playwright";
import { expect, test } from "playwright/test";
import { seed, removeDb } from "../src/test/seed";

const latestBuild = findLatestBuild();
const appInfo = parseElectronApp(latestBuild);

process.env.CI = "e2e";

type SetupElectron = (section?: "App" | "Onboarding") => Promise<{
  electronApp: ElectronApplication;
  page: Page;
  clickMenuItemById: (id: string) => Promise<unknown>;
  wait: (interval?: number) => Promise<void>;
}>;

export function setupElectron(): SetupElectron {
  let electronApp: ElectronApplication;

  test.beforeAll(async ({}, { testId, titlePath }) => {
    await seed(testId);

    electronApp = await electron.launch({
      args: [appInfo.main],
      executablePath: appInfo.executable,
      env: {
        ...process.env,
        testId,
        testName: `${titlePath.at(1)}`,
      },
    });

    electronApp.on("console", console.log);
    electronApp.on("window", (page) => {
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

  return async (section = "App") => {
    const page = await electronApp.firstWindow();
    await expect(page.locator(`[data-testid="${section}"]`)).toBeVisible();
    return {
      electronApp,
      page,
      clickMenuItemById: (id: string) => clickMenuItemById(electronApp, id),
      wait: (time = 10000) => page.waitForTimeout(time),
    };
  };
}
