import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Edit Collection", () => {
  test("edit the selected Collection", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoCollectionsPage");

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Collections");

    await expect(page.getByRole("heading").first()).toHaveText("Collections");
    await page.keyboard.press("Enter");

    await expect(page.getByRole("heading").first()).toHaveText("Collection 1");
    await clickMenuItemById("editCurrentCollection");

    const modal = page.locator(".ReactModalPortal");
    await expect(modal).toContainText("Edit Collection");

    await page
      .getByPlaceholder("Enter the collection title")
      .fill("New Collection Title");
    await page.keyboard.press("Enter");

    await expect(modal).not.toBeVisible();
    await expect(page.getByRole("heading").first()).toHaveText(
      "New Collection Title"
    );
  });
});
