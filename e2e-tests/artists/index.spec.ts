import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Artists Page", () => {
  test("navigate to the Artists page", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoArtistsPage");
    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Artists"
    );
  });

  test("toggle Artists View mode", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoArtistsPage");
    await expect(page.getByTestId("LatestArtistsView")).toBeInViewport();

    await page.getByRole("button", { name: "Show Artist List" }).click();
    await expect(page.getByTestId("AlphabeticalList")).toBeInViewport();

    await page.getByRole("button", { name: "Show Latest Artists" }).click();
    await expect(page.getByTestId("LatestArtistsView")).toBeInViewport();
  });
});
