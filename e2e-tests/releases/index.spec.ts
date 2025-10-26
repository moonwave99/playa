import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Releases", () => {
  test("navigate to the Releases list", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoReleasesPage");

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Releases");

    await page
      .locator('[data-testid="ReleasesPage"]')
      .getByAltText("Cover of Artist 2 - Release 2-5")
      .click();

    await expect(
      page
        .locator('[data-testid="ReleasesPage"]')
        .locator('[data-hasfocus="true"]', { hasText: "Release 2-5" })
    ).toHaveCount(1);

    await page.keyboard.press("ArrowRight");

    await expect(
      page
        .locator('[data-testid="ReleasesPage"]')
        .locator('[data-hasfocus="true"]', { hasText: "Release 3-5" })
    ).toHaveCount(1);
  });
});
