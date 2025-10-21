import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { clickMenuItemById } from "electron-playwright-helpers";

const getElectronApp = setupElectron();

test.describe("Releases", () => {
  test("remove a single Release from library", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Releases page").click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Releases")
    ).toBeVisible();

    await page
      .locator('[data-testid="ReleasesPage"]')
      .getByAltText("Cover of Artist 2 - Release 2-5")
      .click();

    await expect(
      page
        .locator('[data-testid="ReleasesPage"]')
        .locator('[data-hasfocus="true"]', { hasText: "Release 2-5" })
    ).toBeVisible();

    await clickMenuItemById(electronApp, "deleteReleases");

    await expect(
      page.locator('[data-testid="ReleasesPage"]').getByText("Release 2-5")
    ).not.toBeVisible();
  });
});
