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

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Groups")
    ).toBeVisible();

    await expect(page.locator('[data-testid="GroupsPage"]')).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.locator('[data-testid="GroupPage"]')).toBeVisible();
    await clickMenuItemById(electronApp, "editGroup");

    await expect(
      page.locator(".ReactModalPortal").getByText("Edit Group").first()
    ).toBeVisible();

    await page
      .getByPlaceholder("Enter the group title")
      .fill("New Group Title");
    await page.keyboard.press("Enter");

    await expect(page.locator(".ReactModalPortal")).not.toBeVisible();
    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("New Group Title")
    ).toBeInViewport();
  });
});
