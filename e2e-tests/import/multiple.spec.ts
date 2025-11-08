/* eslint-disable no-empty-pattern */
import path from "node:path";
import { remove } from "fs-extra";
import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { cleanup } from "../../src/test/seed";
import { createAlbum } from "../../src/test/tracks";
import { getE2ETmpPath } from "../../src/test/utils";

const getElectronApp = setupElectron();

test.beforeAll(async ({}, { testId }) => {
  await cleanup({ testId, preserveSettings: true });

  await Promise.all(
    Array.from({ length: 2 }, (_, i) =>
      createAlbum({
        libraryPath: path.join(getE2ETmpPath(testId), "LIBRARY_PATH"),
        artist: "Artist 1",
        album: `Album ${i + 1}`,
      })
    )
  );
});

test.afterAll(async ({}, { testId }) => remove(getE2ETmpPath(testId)));

test.describe("Import Multiple", () => {
  test("import multiple folders into library", async () => {
    const { page, clickMenuItemById } = await getElectronApp();
    await clickMenuItemById("gotoHomePage");
    await expect(
      page.getByRole("heading").filter({ hasText: "Latest Releases" })
    ).toBeVisible();

    await clickMenuItemById("importFolder");
    await expect(
      page.getByRole("heading").filter({ hasText: "Import Folders" })
    ).toBeVisible();

    const modal = page.locator(".ReactModalPortal");
    await expect(modal.getByLabel("Release title")).toHaveValue("Album 1");
    await page.getByRole("button").filter({ hasText: "Import Folder" }).click();

    await expect(modal.getByLabel("Release title")).toHaveValue("Album 2");
    await page.getByRole("button").filter({ hasText: "Import Folder" }).click();

    await page.getByRole("button", { name: "Close Modal" }).click();

    await expect(
      page
        .locator('[data-testid="LatestReleases"]')
        .getByText("Album 1", { exact: true })
    ).toBeVisible();

    await expect(page.locator('[data-testid="LatestArtists"]')).toContainText(
      "Artist 1"
    );

    await clickMenuItemById("gotoArtistsPage");

    const artistsList = page.locator('[data-testid="LatestArtistsView"]');
    await artistsList.getByText("Artist 1").click();

    const artistHeader = page.locator('[data-testid="ArtistPageHeader"]');
    await expect(artistHeader).toContainText("Artist 1");
    await expect(artistHeader).toContainText("2 Releases");

    const releaseList = page.locator('[data-testid="ReleaseList"]');
    await Promise.all(
      Array.from({ length: 2 }, (_, i) =>
        expect(releaseList).toContainText(`Album ${i + 1}`)
      )
    );
  });
});
