import { expect, test } from "@playwright/test";
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";
import { ElectronApplication, _electron as electron } from "playwright";

let electronApp: ElectronApplication;

test.beforeAll(async () => {
  const latestBuild = findLatestBuild();
  const appInfo = parseElectronApp(latestBuild);

  process.env.CI = "e2e";

  electronApp = await electron.launch({
    args: [appInfo.main],
    executablePath: appInfo.executable,
  });

  electronApp.on("window", async (page) => {
    const filename = page.url()?.split("/").pop();
    console.log(`Window opened: ${filename}`);

    page.on("pageerror", (error) => {
      console.error(error);
    });

    page.on("console", (msg) => {
      console.log(msg.text());
    });
  });
});

test.afterAll(() => electronApp.close);

test("renders the Homepage", async () => {
  const page = await electronApp.firstWindow();
  await page.evaluate(() => window.localStorage.clear());

  await page.waitForSelector('[data-testid="HomePage"]');

  expect(page.getByText("Latest Releases")).toBeTruthy();
  expect(page.getByText("Home")).toBeTruthy();
});

test("navigates back to the Homepage", async () => {
  const page = await electronApp.firstWindow();
  await page.evaluate(() => window.localStorage.clear());

  await page.getByRole("button", { name: "Toggle Menu" }).click();

  await page.getByLabel("Go to the Releases page").click();
  await page.waitForSelector('[data-testid="ReleasesPage"]');

  expect(page.getByText("Home")).toBeTruthy();
  expect(page.getByText("Releases")).toBeTruthy();
});
