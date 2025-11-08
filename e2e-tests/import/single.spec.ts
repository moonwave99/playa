/* eslint-disable no-empty-pattern */
import path from "node:path";
import { remove } from "fs-extra";
import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { cleanup } from "../../src/test/seed";
import { createAlbum } from "../../src/test/tracks";
import { getE2ETmpPath } from "../../src/test/utils";
import { pad } from "../../src/lib/utils";

const getElectronApp = setupElectron();

test.beforeAll(async ({}, { testId }) => {
  await cleanup({ testId, preserveSettings: true });
  await createAlbum({
    libraryPath: path.join(getE2ETmpPath(testId), "LIBRARY_PATH"),
    artist: "Artist 1",
    album: "Album 1",
  });
});

test.afterAll(async ({}, { testId }) => remove(getE2ETmpPath(testId)));

test.describe("Import Single", () => {
  test("import a folder into library", async () => {
    const { page, clickMenuItemById } = await getElectronApp();
    await clickMenuItemById("gotoHomePage");
    await expect(
      page.getByRole("heading").filter({ hasText: "Latest Releases" })
    ).toBeVisible();

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(page.getByRole("heading").first()).toHaveText("Playa");

    await clickMenuItemById("importFolder");
    await expect(
      page.getByRole("heading").filter({ hasText: "Import Folders" })
    ).toBeVisible();
    await page.getByRole("button").filter({ hasText: "Import Folder" }).click();
    await page.getByRole("button", { name: "Close Modal" }).click();

    await expect(
      page
        .locator('[data-testid="LatestReleases"]')
        .getByRole("listitem")
        .filter({ hasText: "Album 1" })
    ).toBeVisible();

    await expect(page.locator('[data-testid="LatestArtists"]')).toContainText(
      "Artist 1"
    );

    await clickMenuItemById("gotoArtistsPage");
    await expect(breadcrumbs.getByText("Artists")).toBeVisible();

    const artistsList = page.locator('[data-testid="LatestArtistsView"]');

    await expect(artistsList).toContainText("Artist 1");

    await artistsList.getByText("Artist 1").click();
    const artistHeader = page.locator('[data-testid="ArtistPageHeader"]');
    await expect(artistHeader).toContainText("Artist 1");
    await expect(artistHeader).toContainText("1 Releases");

    await page
      .locator('[data-testid="ReleaseList"]')
      .getByText("Album 1", { exact: true })
      .first()
      .click();

    await expect(
      page.locator('[data-testid="ReleasePageHeader"]')
    ).toContainText("Album 1");

    const tracklist = page.locator('[data-testid="Tracklist"]');

    await expect(tracklist).toBeVisible();

    await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        expect(tracklist).toContainText(`Track ${pad(i + 1)}`)
      )
    );
  });
});
