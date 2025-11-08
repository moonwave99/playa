/* eslint-disable no-empty-pattern */
import path from "node:path";
import { remove } from "fs-extra";
import { expect, test } from "@playwright/test";
import { setupElectron } from "../../electron";
import { createAlbum } from "../../../src/test/tracks";
import { getE2ETmpPath } from "../../../src/test/utils";

const getElectronApp = setupElectron();

test.beforeAll(async ({}, { testId }) => {
  await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      createAlbum({
        libraryPath: path.join(getE2ETmpPath(testId), "LIBRARY_PATH"),
        artist: "Artist 2",
        album: `Release 2-${i + 1}`,
        customPath: `New Artist Folder/2000 - Release 2-${i + 1}`,
      })
    )
  );
});

test.afterAll(async ({}, { testId }) => remove(getE2ETmpPath(testId)));

test.describe("Relocate Artist Folder", () => {
  test("select a new folder for the current Release", async () => {
    const { page, clickMenuItemById } = await getElectronApp();
    await clickMenuItemById("gotoArtistsPage");

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Artists");

    await page
      .locator('[data-testid="ArtistsPage"]')
      .getByRole("link")
      .filter({ hasText: "Artist 2" })
      .first()
      .click();

    await page
      .getByLabel("Take actions for missing Artist folder: Artist 2")
      .click();

    const modal = page.locator(".ReactModalPortal");
    await expect(modal.getByRole("heading").first()).toHaveText(
      "Missing Artist Folder"
    );

    await page
      .getByRole("button")
      .filter({ hasText: "Relocate Artist Folder" })
      .click();

    await expect(
      page.getByLabel("Take actions for missing Artist folder: Artist 2")
    ).not.toBeVisible();
  });
});
