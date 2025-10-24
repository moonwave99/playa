import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Edit Collection", () => {
  test("edit the selected Collection", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Collections page").click();

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Collections");

    await expect(page.locator('[data-testid="CollectionsPage"]')).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.locator('[data-testid="CollectionPage"]')).toBeVisible();
    await clickMenuItemById(electronApp, "editCurrentCollection");

    const modal = page.locator(".ReactModalPortal");
    await expect(modal).toContainText("Edit Collection");

    await page
      .getByPlaceholder("Enter the collection title")
      .fill("New Collection Title");
    await page.keyboard.press("Enter");

    await expect(modal).not.toBeVisible();
    await expect(breadcrumbs).toContainText("New Collection Title");
  });
});
