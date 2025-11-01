import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Group Cover", () => {
  test("set the Group Cover artist", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoGroupsPage");

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Groups"
    );

    const groupsList = page.locator('[data-testid="GroupsList"]');

    await groupsList.getByRole("link").filter({ hasText: "Group 1" }).click();

    await expect(page.locator('[data-testid="GroupPage"]')).toBeVisible();

    const releaseList = page.locator('[data-testid="ArtistList"]');
    await page.keyboard.press("ArrowRight");

    await expect(
      releaseList.locator('[data-hasfocus="true"]').getByRole("link").filter({
        hasText: "Artist 2",
      })
    ).toHaveCount(1);

    await clickMenuItemById("setSelectedArtistAsGroupCover");

    await page.getByLabel("Go Back").click();

    await expect(
      groupsList
        .getByRole("listitem")
        .filter({ hasText: "Group 1" })
        .getByAltText("Cover of Artist 2 - Release 2-1")
    ).toHaveCount(1);
  });
});
