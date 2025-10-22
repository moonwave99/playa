import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Delete Collection", () => {
  test("delete the selected Collection", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Collections page").click();

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Collections"
    );

    await expect(page.locator('[data-testid="CollectionsPage"]')).toBeVisible();
    await page.keyboard.down("Meta");
    await page.keyboard.press("Backspace");
    await page.keyboard.up("Meta");

    await expect(
      page.locator('[data-testid="CollectionsList"]')
    ).not.toContainText("Collection 1");

    await page.getByRole("button", { name: "Open Search" }).click();
    await page.getByPlaceholder("Enter search term").fill("Release 1-1");
    await page
      .locator('[data-testid="SearchResultsView"]')
      .getByRole("link")
      .filter({
        hasText: "Release 1-1",
      })
      .click();

    const header = page.locator('[data-testid="ReleaseWithTracklistHeader"]');
    await expect(header).not.toContainText("Collection 1");
  });
});
