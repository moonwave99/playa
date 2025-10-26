import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Releases", () => {
  test("delete a single Release from library", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoReleasesPage");
    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Releases"
    );

    const releaseList = page.locator('[data-testid="ReleaseList"]');

    await releaseList.getByAltText("Cover of Artist 2 - Release 2-5").click();

    await expect(
      page
        .locator('[data-testid="ReleasesPage"]')
        .locator('[data-hasfocus="true"]', { hasText: "Release 2-5" })
    ).toHaveCount(1);

    await clickMenuItemById("deleteSelectedReleases");

    await expect(
      releaseList.filter({ hasText: "Release 2-5" })
    ).not.toBeVisible();
  });
});
