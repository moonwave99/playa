import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("New Related Artist", () => {
  test("add a new Related Artist to current Artist", async () => {
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

    await modal.getByPlaceholder("Lookup Artists").fill("New Related Artist");
    await modal.getByText('Create "New Related Artist"').click();
    await page.keyboard.press("Escape");

    const artistHeader = page.locator('[data-testid="ArtistPageHeader"]');

    await expect(artistHeader).toContainText("Related to");
    await expect(artistHeader).toContainText("New Related Artist");
  });
});
