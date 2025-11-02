import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Related Artists", () => {
  test("add a related Artist to current Artist", async () => {
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

    await modal.getByPlaceholder("Lookup Artists").fill("Artist 2");
    await modal.getByText("Artist 2", { exact: true }).click();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const artistHeader = page.locator('[data-testid="ArtistPageHeader"]');

    await expect(artistHeader).toContainText("Related to");
    await expect(artistHeader).toContainText("Artist 2");
  });

  test("remove a related Artist from current Artist", async () => {
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
    const artistHeader = page.locator('[data-testid="ArtistPageHeader"]');

    await artistHeader.getByText("Artist 2").hover();
    await artistHeader.getByLabel("Disconnect Artist 2 from Artist 10").click();

    await expect(artistHeader).not.toContainText("Related to");
    await expect(artistHeader).not.toContainText("Artist 2");
  });
});
