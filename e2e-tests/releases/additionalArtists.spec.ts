import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Releases", () => {
  test("add additional Artists to a Release", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoReleasesPage");

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Releases");

    await page
      .locator('[data-testid="ReleasesPage"]')
      .getByRole("link")
      .filter({ hasText: "Release 1-5" })
      .click();

    await clickMenuItemById("editSelectedRelease");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal).toContainText("Edit Release");

    await modal.getByLabel("Lookup Artists").fill("Artist 2");
    await modal.getByLabel("Add Artist 2 to related Artists").click();
    await modal.getByLabel("Lookup Artists").fill("Artist 3");
    await modal.getByLabel("Add Artist 3 to related Artists").click();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();

    const header = page.locator('[data-testid="ReleasePageHeader"]');

    await expect(header).toContainText("Artist 1");
    await expect(header).toContainText("Artist 2");
    await expect(header).toContainText("Artist 3");

    await clickMenuItemById("editCurrentRelease");

    await expect(modal).toContainText("Edit Release");
    await modal.getByLabel("Remove Artist 2 from related Artists").click();

    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();

    await expect(header).toContainText("Artist 1");
    await expect(header).not.toContainText("Artist 2");
    await expect(header).toContainText("Artist 3");
  });
});
