import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { clickMenuItemById } from "electron-playwright-helpers";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Artist Cover", () => {
  test("set the Artist Cover release", async () => {
    const electronAp = getElectronApp();
    const page = await electronAp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();
    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Artists"
    );

    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByText("Artist 10")
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();
    await expect(
      page
        .locator('[data-testid="ArtistPageHeader"]')
        .getByAltText("Cover of Artist 10 - Release 10-1")
    ).toBeVisible();

    const releaseList = page.locator('[data-testid="ReleaseList"]');
    await page.keyboard.press("ArrowRight");

    await expect(
      releaseList.locator('[data-hasfocus="true"]', { hasText: "Release 10-2" })
    ).toHaveCount(1);

    await clickMenuItemById(electronAp, "setSelectedReleaseAsArtistCover");

    await expect(
      page
        .locator('[data-testid="ArtistPageHeader"]')
        .getByAltText("Cover of Artist 10 - Release 10-2")
    ).toBeVisible();
  });
});
