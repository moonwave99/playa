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

    await modal
      .getByPlaceholder("Lookup Artists")
      .fill("New Additional Artist");
    await modal.getByText('Create "New Additional Artist"').click();
    await modal.getByPlaceholder("Lookup Artists").fill("Artist 2");
    await modal.getByText("Artist 2", { exact: true }).click();
    await page.keyboard.press("Escape");

    await expect(modal).not.toBeVisible();

    const header = page.locator('[data-testid="ReleasePageHeader"]');

    await expect(header).toContainText("Artist 1");
    await expect(header).toContainText("Artist 2");
    await expect(header).toContainText("New Additional Artist");

    await clickMenuItemById("editCurrentRelease");
    await expect(modal).toContainText("Edit Release");

    await modal
      .getByLabel("Remove New Additional Artist from related Artists")
      .click();

    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();

    await expect(header).toContainText("Artist 1");
    await expect(header).not.toContainText("New Additional Artist");
  });
});
