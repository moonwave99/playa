/* eslint-disable no-empty-pattern */

import { expect, test } from "@playwright/test";
import { setupElectron } from "../../electron";

const getElectronApp = setupElectron();

test.describe("Relocate Artist Folder - Empty Folder", () => {
  test("select a new folder for the current Release", async () => {
    const { page, clickMenuItemById } = await getElectronApp();
    await clickMenuItemById("gotoArtistsPage");

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Artists");

    await page
      .locator('[data-testid="ArtistsPage"]')
      .getByRole("link")
      .filter({ hasText: "Artist 2" })
      .first()
      .click();

    await page
      .getByLabel("Take actions for missing Artist folder: Artist 2")
      .click();

    const modal = page.locator(".ReactModalPortal");
    await expect(modal.getByRole("heading").first()).toHaveText(
      "Missing Artist Folder"
    );

    await page
      .getByRole("button")
      .filter({ hasText: "Relocate Artist Folder" })
      .click();

    await expect(
      page.getByLabel("Take actions for missing Artist folder: Artist 2")
    ).toBeVisible();
  });
});
