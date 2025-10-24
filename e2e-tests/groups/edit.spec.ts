import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Edit Group", () => {
  test("edit the selected Group", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Groups page").click();

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Groups");

    await expect(page.locator('[data-testid="GroupsPage"]')).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.locator('[data-testid="GroupPage"]')).toBeVisible();
    await clickMenuItemById(electronApp, "editCurrentGroup");

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
