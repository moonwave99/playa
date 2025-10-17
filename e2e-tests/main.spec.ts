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

test.describe.serial("Main", () => {
  test("renders the Homepage", async () => {
    const page = await electronApp.firstWindow();
    await page.evaluate(() => window.localStorage.clear());

    await page.waitForSelector('[data-testid="HomePage"]');

    expect(page.getByText("Latest Releases")).toBeVisible();
    expect(
      page.locator("span").filter({ hasText: "Home" }).first()
    ).toBeVisible();

    expect(page.getByText("Release 1-5")).toBeVisible();
    expect(page.getByText("Release 2-5")).toBeVisible();
    expect(page.getByText("Release 3-5")).toBeVisible();
    expect(page.getByText("Release 4-5")).toBeVisible();
    expect(page.getByText("Release 5-5")).toBeVisible();

    expect(page.getByText("Artist 10")).toBeVisible();
    expect(page.getByText("Artist 9")).toBeVisible();
    expect(page.getByText("Artist 8")).toBeVisible();

    expect(page.getByText("Collection 1")).toBeTruthy();
    expect(page.getByText("Collection 2")).toBeTruthy();
    expect(page.getByText("Collection 3")).toBeTruthy();

    expect(page.getByText("Group 1")).toBeTruthy();
    expect(page.getByText("Group 2")).toBeTruthy();
    expect(page.getByText("Group 3")).toBeTruthy();
  });

  test("navigates to the Releases page", async () => {
    const page = await electronApp.firstWindow();
    await page.evaluate(() => window.localStorage.clear());

    await page.getByRole("button", { name: "Toggle Menu" }).click();

    await page.getByLabel("Go to the Releases page").click();
    await page.waitForSelector('[data-testid="ReleasesPage"]');

    expect(
      page.locator("span").filter({ hasText: "Home" }).first()
    ).toBeVisible();

    expect(
      page.locator("span").filter({ hasText: "Releases" }).first()
    ).toBeVisible();
  });
});
