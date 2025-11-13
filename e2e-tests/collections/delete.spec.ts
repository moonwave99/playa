import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Delete Collection", () => {
  test("delete the selected Collection", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoCollectionsPage");

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Collections"
    );

    await expect(page.locator('[data-testid="CollectionsPage"]')).toBeVisible();

    const collectionsList = page.locator('[data-testid="CollectionsList"]');

    await expect(collectionsList.locator('[data-hasfocus="true"]')).toHaveCount(
      1
    );
    await clickMenuItemById("deleteSelectedCollections");

    await expect(collectionsList).not.toContainText("Collection 1");

    await page.getByRole("link", { name: "Goto Search" }).click();
    await page.getByPlaceholder("Enter search term").fill("Release 1-1");
    await page
      .locator('[data-testid="SearchResultsView"]')
      .getByRole("link")
      .filter({
        hasText: "Release 1-1",
      })
      .click();

    const header = page.locator('[data-testid="ReleasePageHeader"]');
    await expect(header).not.toContainText("Collection 1");
  });
});
