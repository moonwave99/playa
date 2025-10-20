import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Collection", () => {
  test("add a Release to the selected Collection", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Collections page").click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Collections")
    ).toBeVisible();

    await expect(page.locator('[data-testid="CollectionsPage"]')).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.locator('[data-testid="CollectionPage"]')).toBeVisible();
    await expect(page.locator('[data-testid="ReleaseList"]')).toBeVisible();
    await clickMenuItemById(electronApp, "editCollection");

    const modal = page.locator(".ReactModalPortal");

    await expect(modal.getByText("Edit Collection").first()).toBeVisible();

    await page.getByPlaceholder("Search for Entity").fill("Rel");
    await modal.getByText("Release 1-4").click();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    await expect(modal).not.toBeVisible();

    await expect(
      page.locator('[data-testid="ReleaseList"]').getByText("Release 1-4")
    ).toBeVisible();
  });
});
