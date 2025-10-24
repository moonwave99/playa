import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Edit Release", () => {
  test("edit the selected Release", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Releases page").click();

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Releases"
    );

    await clickMenuItemById(electronApp, "editSelectedRelease");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal).toContainText("Edit Release");
    await expect(modal).toContainText("Release 1-5");

    await page.getByPlaceholder("Enter title").fill("New Release Title");
    await page.getByPlaceholder("Enter year").fill("2999");
    await page.getByLabel("Release type").selectOption("Compilation");

    await page.keyboard.press("Enter");
    await expect(modal).not.toBeVisible();

    const release = page
      .locator('[data-testid="ReleaseList"]')
      .getByRole("listitem")
      .filter({ hasText: "New Release Title" });

    await expect(release).toBeVisible();
    await expect(release).toContainText("2999");
    await expect(release).toContainText("Compilation");
  });
});
