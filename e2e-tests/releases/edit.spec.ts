import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Edit Release", () => {
  test("edit the selected Release", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoReleasesPage");

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Releases"
    );

    await clickMenuItemById("editSelectedRelease");
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
