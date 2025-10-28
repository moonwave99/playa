import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Collections Page", () => {
  test("navigate to the Collections page", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoCollectionsPage");
    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Collections"
    );
  });

  test("toggle Collections View mode", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoCollectionsPage");
    await expect(page.getByTestId("CollectionsList")).toBeInViewport();

    await page.getByRole("button", { name: "Show Collection List" }).click();
    await expect(page.getByTestId("AlphabeticalList")).toBeInViewport();

    await page.getByRole("button", { name: "Show Latest Collections" }).click();
    await expect(page.getByTestId("CollectionsList")).toBeInViewport();
  });
});
