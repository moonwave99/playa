import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Group", () => {
  test("add an Artist to an existing Group", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoGroupsPage");

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Groups"
    );

    await expect(page.locator('[data-testid="GroupsPage"]')).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.locator('[data-testid="GroupPage"]')).toBeVisible();
    await expect(page.locator('[data-testid="ArtistList"]')).toBeVisible();
    await clickMenuItemById("editCurrentGroup");

    const modal = page.locator(".ReactModalPortal");

    await expect(modal).toContainText("Edit Group");

    await page.getByPlaceholder("Search for Entity").fill("Art");
    await modal.getByText("Artist 4").click();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    await expect(modal).not.toBeVisible();

    await expect(page.locator('[data-testid="ArtistList"]')).toContainText(
      "Artist 4"
    );
  });
});
