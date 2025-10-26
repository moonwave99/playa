import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Edit Group", () => {
  test("edit the selected Group", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoGroupsPage");

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Groups");

    await expect(page.locator('[data-testid="GroupsPage"]')).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.locator('[data-testid="GroupPage"]')).toBeVisible();
    await clickMenuItemById("editCurrentGroup");

    const modal = page.locator(".ReactModalPortal");

    await expect(modal).toContainText("Edit Group");

    await page
      .getByPlaceholder("Enter the Group title")
      .fill("New Group Title");
    await page.keyboard.press("Enter");

    await expect(modal).not.toBeVisible();
    await expect(breadcrumbs).toContainText("New Group Title");
  });
});
