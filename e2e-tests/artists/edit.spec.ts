import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Edit Artist", () => {
  test("edit the selected Artist", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Artists")
    ).toBeVisible();

    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByText("Artist 10")
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    await clickMenuItemById(electronApp, "editArtist");

    await expect(
      page.locator(".ReactModalPortal").getByText("Edit Artist").first()
    ).toBeVisible();

    await page
      .getByPlaceholder("Enter the artist name")
      .fill("New Artist Name");
    await page.keyboard.press("Enter");

    await expect(page.locator(".ReactModalPortal")).not.toBeVisible();
    await expect(
      page
        .locator('[data-testid="ArtistPageHeader"]')
        .getByText("New Artist Name")
    ).toBeInViewport();
  });
});
