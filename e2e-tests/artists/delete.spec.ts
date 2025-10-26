import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Delete Artist", () => {
  test("delete the selected Artist", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoArtistsPage");

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Artists");

    await expect(page.locator('[data-testid="ArtistsPage"]')).toBeVisible();
    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByRole("link")
      .filter({ hasText: /Artist 1$/ })
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    await clickMenuItemById("deleteSelectedArtists");

    await expect(breadcrumbs).not.toContainText("Artists");

    await clickMenuItemById("gotoArtistsPage");

    await expect(breadcrumbs).toContainText("Artists");

    await expect(
      page
        .locator('[data-testid="LatestArtistsView"]')
        .getByRole("link")
        .filter({ hasText: /Artist 1$/ })
    ).toHaveCount(0);
  });
});
