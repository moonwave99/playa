/* eslint-disable no-empty-pattern */
import path from "node:path";
import { remove } from "fs-extra";
import { expect, test } from "@playwright/test";
import { setupElectron } from "../../electron";
import { createAlbum } from "../../../src/test/tracks";
import { getE2ETmpPath } from "../../../src/test/utils";

const getElectronApp = setupElectron();

test.beforeAll(async ({}, { testId }) => {
  await createAlbum({
    libraryPath: path.join(getE2ETmpPath(testId), "LIBRARY_PATH"),
    artist: "Artist 1",
    album: "New Folder",
    trackLength: 3,
  });
});

test.afterAll(async ({}, { testId }) => remove(getE2ETmpPath(testId)));

test.describe("Relocate Release Folder", () => {
  test("select a new folder for the current Release", async () => {
    const { page, clickMenuItemById } = await getElectronApp();
    await clickMenuItemById("gotoReleasesPage");

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Releases");

    await page
      .locator('[data-testid="ReleasesPage"]')
      .getByRole("link")
      .filter({ hasText: "Release 1-5" })
      .click();

    await page
      .getByLabel("Take actions for missing Release folder: Release 1-5")
      .click();

    const modal = page.locator(".ReactModalPortal");
    await expect(modal.getByRole("heading").first()).toHaveText(
      "Missing Release Folder"
    );

    await page
      .getByRole("button")
      .filter({ hasText: "Relocate Release" })
      .click();

    await expect(
      page.getByLabel("Take actions for missing Release folder: Release 1-5")
    ).toBeVisible();
  });
});
