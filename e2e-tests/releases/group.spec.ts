import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Releases", () => {
  test("group Releases", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();
    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await expect(
      page.locator('[data-testid="LatestArtistsView"]')
    ).toBeVisible();

    await page.keyboard.press("Enter");

    expect(page.locator('[data-testid="ReleaseList"] article')).toHaveCount(5);

    await page
      .locator('[data-testid="ReleaseList"]')
      .getByAltText("Cover of Artist 10 - Release 10-2")
      .click({ modifiers: ["Meta"] });

    await clickMenuItemById(electronApp, "groupReleases");
    await expect(page.getByText("Group Releases").first()).toBeInViewport();

    await page.getByLabel("Main Release Title").fill("Grouped Release");

    await page.keyboard.press("Enter");

    await expect(
      page.locator('[data-testid="ReleaseList"]').getByText("Grouped Release")
    ).toBeInViewport();
    await expect(
      page.locator('[data-testid="ReleaseList"]').getByText("(2 discs)")
    ).toBeInViewport();

    expect(page.locator('[data-testid="ReleaseList"] article')).toHaveCount(4);

    await page
      .locator('[data-testid="ReleaseList"]')
      .getByAltText("Cover of Artist 10 - Grouped Release")
      .click();

    await page.waitForTimeout(100);

    await clickMenuItemById(electronApp, "unGroupRelease");

    await page.waitForTimeout(100);

    expect(page.locator('[data-testid="ReleaseList"] article')).toHaveCount(5);
  });
});
