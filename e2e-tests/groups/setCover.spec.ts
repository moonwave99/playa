import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { clickMenuItemById } from "electron-playwright-helpers";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Group Cover", () => {
  test("set the Group Cover artist", async () => {
    const electronAp = getElectronApp();
    const page = await electronAp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Groups page").click();

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Groups"
    );

    const groupsList = page.locator('[data-testid="GroupsList"]');

    await groupsList.getByRole("link").filter({ hasText: "Group 1" }).click();

    await expect(page.locator('[data-testid="GroupPage"]')).toBeVisible();

    const releaseList = page.locator('[data-testid="ArtistList"]');
    await page.keyboard.press("ArrowRight");

    await expect(
      releaseList.locator('[data-hasfocus="true"]').getByRole("link").filter({
        hasText: "Artist 2",
      })
    ).toHaveCount(1);

    await clickMenuItemById(electronAp, "setSelectedArtistAsGroupCover");

    await page.goBack();

    await expect(
      groupsList
        .getByRole("listitem")
        .filter({ hasText: "Group 1" })
        .getByAltText("Cover of Artist 2 - Release 2-1")
    ).toHaveCount(1);
  });
});
