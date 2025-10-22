/* eslint-disable no-empty-pattern */
import path from "node:path";
import { remove } from "fs-extra";
import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";
import { cleanup } from "../../src/test/seed";
import { createAlbum } from "../../src/test/tracks";
import { getE2ETmpPath } from "../../src/test/utils";
import { pad } from "../../src/lib/utils";

const getElectronApp = setupElectron();

test.beforeAll(async ({}, { testId }) => {
  await cleanup({ id: testId, preserveSettings: true });
  await createAlbum({
    libraryPath: path.join(getE2ETmpPath(testId), "Library"),
    artist: "Artist 1",
    album: "Album 1",
  });
});

test.afterAll(async ({}, { testId }) => {
  await remove(getE2ETmpPath(testId));
});

test.describe("Import", () => {
  test("import a folder into library", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();
    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Home page").click();
    await expect(page.getByText("Latest Releases")).toBeVisible();
    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs).toContainText("Home");

    await clickMenuItemById(electronApp, "importFolder");

    await page.getByRole("button", { name: "Close" }).click();

    await expect(
      page
        .locator('[data-testid="LatestReleases"]')
        .getByText("Album 1", { exact: true })
    ).toBeVisible();

    await expect(page.locator('[data-testid="LatestArtists"]')).toContainText(
      "Artist 1"
    );

    await clickMenuItemById(electronApp, "navigate-artists");
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
      page.locator('[data-testid="ReleaseWithTracklistHeader"]')
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
