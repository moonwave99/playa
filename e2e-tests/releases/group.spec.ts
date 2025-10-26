import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Releases", () => {
  test("group Releases", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoArtistsPage");
    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await expect(
      page.locator('[data-testid="LatestArtistsView"]')
    ).toBeVisible();

    await page.keyboard.press("Enter");

    await expect(
      page
        .locator('[data-testid="ReleaseList"]')
        .getByRole("listitem")
        .filter({ has: page.locator("article") })
    ).toHaveCount(5);

    await page
      .locator('[data-testid="ReleaseList"]')
      .getByAltText("Cover of Artist 10 - Release 10-2")
      .click({ modifiers: ["Meta"] });

    await clickMenuItemById("groupReleases");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal).toContainText("Group Releases");
    await expect(page.getByText("Group Releases").first()).toBeInViewport();

    await page.getByLabel("Main Release Title").fill("Grouped Release");

    await page.keyboard.press("Enter");
    await expect(modal).not.toBeVisible();

    const release = page
      .locator('[data-testid="ReleaseList"]')
      .getByRole("listitem")
      .filter({ hasText: "Grouped Release" });

    await expect(release).toBeVisible();
    await expect(release).toContainText("(2 discs)");

    await expect(
      page
        .locator('[data-testid="ReleaseList"]')
        .getByRole("listitem")
        .filter({ has: page.locator("article") })
    ).toHaveCount(4);

    await page
      .locator('[data-testid="ReleaseList"]')
      .getByAltText("Cover of Artist 10 - Grouped Release")
      .click();

    await page.waitForTimeout(100);

    await clickMenuItemById("unGroupRelease");

    await page.waitForTimeout(100);

    await expect(
      page
        .locator('[data-testid="ReleaseList"]')
        .getByRole("listitem")
        .filter({ has: page.locator("article") })
    ).toHaveCount(5);
  });
});
