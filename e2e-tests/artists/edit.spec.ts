import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Edit Artist", () => {
  test("edit the selected Artist", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoArtistsPage");

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Artists"
    );

    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByText("Artist 10")
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    await clickMenuItemById("editSelectedArtist");

    const modal = page.locator(".ReactModalPortal");
    await expect(modal).toContainText("Edit Artist");

    await page.getByPlaceholder("Enter Artist Name").fill("New Artist Name");
    await page.keyboard.press("Enter");

    await expect(modal).not.toBeVisible();
    await expect(
      page.locator('[data-testid="ArtistPageHeader"]')
    ).toContainText("New Artist Name");
  });
});
