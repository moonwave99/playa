import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { clickMenuItemById } from "electron-playwright-helpers";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Collection Cover", () => {
  test("set the Collection Cover release", async () => {
    const electronAp = getElectronApp();
    const page = await electronAp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Collections page").click();

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Collections"
    );

    const collectionsList = page.locator('[data-testid="CollectionsList"]');

    await collectionsList
      .getByRole("link")
      .filter({ hasText: "Collection 1" })
      .click();

    await expect(page.locator('[data-testid="CollectionPage"]')).toBeVisible();

    const releaseList = page.locator('[data-testid="ReleaseList"]');
    await page.keyboard.press("ArrowRight");

    await expect(
      releaseList.locator('[data-hasfocus="true"]').getByRole("link").filter({
        hasText: "Release 1-2",
      })
    ).toHaveCount(1);

    await clickMenuItemById(electronAp, "setSelectedReleaseAsCollectionCover");

    await page.goBack();

    await expect(
      collectionsList
        .getByRole("listitem")
        .filter({ hasText: "Collection 1" })
        .getByAltText("Cover of Artist 1 - Release 1-2")
    ).toHaveCount(1);
  });
});
