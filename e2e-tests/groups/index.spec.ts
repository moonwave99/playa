import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Groups Page", () => {
  test("navigate to the Groups page", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoGroupsPage");
    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Groups"
    );
    await expect(page.getByRole("heading").first()).toHaveText("Groups");
  });

  test("toggle Groups View mode", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoGroupsPage");
    await expect(page.getByTestId("GroupsList")).toBeInViewport();

    await page.getByRole("button", { name: "Show Group List" }).click();
    await expect(page.getByTestId("AlphabeticalList")).toBeInViewport();

    await page.getByRole("button", { name: "Show Latest Groups" }).click();
    await expect(page.getByTestId("GroupsList")).toBeInViewport();
  });
});
