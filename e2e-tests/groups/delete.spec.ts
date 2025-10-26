import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Delete Group", () => {
  test("delete the selected Group", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoGroupsPage");

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Groups"
    );

    await expect(page.locator('[data-testid="GroupsPage"]')).toBeVisible();
    await clickMenuItemById("deleteSelectedGroups");

    await expect(page.locator('[data-testid="GroupsList"]')).not.toContainText(
      "Group 1"
    );

    await page.getByRole("button", { name: "Open Search" }).click();
    await page.getByPlaceholder("Enter search term").fill("Artist 1");
    await page
      .locator('[data-testid="SearchResultsView"]')
      .getByRole("link")
      .filter({
        hasText: "Artist 1",
      })
      .first()
      .click();

    const header = page.locator('[data-testid="ArtistPageHeader"]');
    await expect(header).not.toContainText("Group 1");
  });
});
