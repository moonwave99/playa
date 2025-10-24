import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { clickMenuItemById } from "electron-playwright-helpers";

const getElectronApp = setupElectron();

test.describe("Releases", () => {
  test("delete a single Release from library", async () => {
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
      page
        .locator('[data-testid="ReleasesPage"]')
        .locator('[data-hasfocus="true"]', { hasText: "Release 2-5" })
    ).toHaveCount(1);

    await clickMenuItemById(electronApp, "deleteSelectedReleases");

    await expect(
      releaseList.filter({ hasText: "Release 2-5" })
    ).not.toBeVisible();
  });
});
