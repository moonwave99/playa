import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { clickMenuItemById } from "electron-playwright-helpers";

const getElectronApp = setupElectron();

test.describe("Releases", () => {
  test("add additional Artists to a Release", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Releases page").click();

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Releases");

    await page
      .locator('[data-testid="ReleasesPage"]')
      .getByRole("link")
      .filter({ hasText: "Release 1-5" })
      .click();

    await clickMenuItemById(electronApp, "editRelease");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal).toContainText("Edit Release");

    await modal.getByLabel("Lookup Artists").fill("Artist 2");
    await modal.getByLabel("Add Artist 2 to related Artists").click();
    await modal.getByLabel("Lookup Artists").fill("Artist 3");
    await modal.getByLabel("Add Artist 3 to related Artists").click();

    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();

    await expect(
      page.locator('[data-testid="ReleaseWithTracklistHeader"]')
    ).toContainText("Artist 1");
    await expect(
      page.locator('[data-testid="ReleaseWithTracklistHeader"]')
    ).toContainText("Artist 2");
    await expect(
      page.locator('[data-testid="ReleaseWithTracklistHeader"]')
    ).toContainText("Artist 3");

    await clickMenuItemById(electronApp, "editRelease");
    await expect(modal).toContainText("Edit Release");

    await modal.getByLabel("Remove Artist 2 from related Artists").click();

    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();

    await expect(
      page.locator('[data-testid="ReleaseWithTracklistHeader"]')
    ).toContainText("Artist 1");
    await expect(
      page.locator('[data-testid="ReleaseWithTracklistHeader"]')
    ).not.toContainText("Artist 2");
    await expect(
      page.locator('[data-testid="ReleaseWithTracklistHeader"]')
    ).toContainText("Artist 3");
  });
});
