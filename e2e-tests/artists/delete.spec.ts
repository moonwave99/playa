import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { clickMenuItemById } from "electron-playwright-helpers";

const getElectronApp = setupElectron();

test.describe("Delete Artist", () => {
  test("delete the selected Artist", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Artists");

    await expect(page.locator('[data-testid="ArtistsPage"]')).toBeVisible();
    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByRole("link")
      .filter({ hasText: /Artist 1$/ })
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    await clickMenuItemById(electronApp, "deleteArtist");

    await expect(breadcrumbs).not.toContainText("Artists");

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();

    await expect(breadcrumbs).toContainText("Artists");

    await expect(
      page
        .locator('[data-testid="LatestArtistsView"]')
        .getByRole("link")
        .filter({ hasText: /Artist 1$/ })
    ).toHaveCount(0);
  });
});
