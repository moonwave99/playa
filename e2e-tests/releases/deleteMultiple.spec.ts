import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { clickMenuItemById } from "electron-playwright-helpers";

const getElectronApp = setupElectron();

test.describe("Releases", () => {
  test("delete multiple Releases from library", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Releases page").click();

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Releases"
    );

    const releaseList = page.locator('[data-testid="ReleaseList"]');

    await releaseList.getByAltText("Cover of Artist 2 - Release 2-5").click();

    await expect(
      releaseList.locator('[data-hasfocus="true"]', { hasText: "Release 2-5" })
    ).toHaveCount(1);

    await releaseList
      .getByAltText("Cover of Artist 3 - Release 3-5")
      .click({ modifiers: ["Meta"] });

    await expect(
      releaseList.locator('[data-hasfocus="true"]', { hasText: "Release 3-5" })
    ).toHaveCount(1);

    await clickMenuItemById(electronApp, "deleteSelectedReleases");

    await expect(
      releaseList.filter({ hasText: "Release 2-5" })
    ).not.toBeVisible();
    await expect(
      releaseList.filter({ hasText: "Release 3-5" })
    ).not.toBeVisible();
  });
});
