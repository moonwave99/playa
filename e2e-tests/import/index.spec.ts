/* eslint-disable no-empty-pattern */
import path from "node:path";
import { remove, ensureDir } from "fs-extra";
import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";
import { cleanup } from "../../src/test/seed";
import { createTrack } from "../../src/test/create-tracks";
import { getE2ETmpPath } from "../../src/test/utils";
import { pad } from "../../src/lib/utils";

const getElectronApp = setupElectron();

test.beforeAll(async ({}, { testId }) => {
  await cleanup({ id: testId, preserveSettings: true });
  const tmpDir = getE2ETmpPath(testId);
  const albumFolder = path.join(
    tmpDir,
    "Library",
    "A",
    "Artist 1",
    "[Album]",
    "1999 - Album 1"
  );
  await ensureDir(albumFolder);

  await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      createTrack({
        outputPath: path.join(albumFolder, `${pad(i + 1)}.mp3`),
        meta: {
          title: `Track ${pad(i + 1)}`,
          artist: "Artist 1",
          album: "Album 1",
          year: "1999",
        },
      })
    )
  );
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
    await expect(breadcrumbs.getByText("Home")).toBeVisible();

    await clickMenuItemById(electronApp, "importFolder");

    await page.getByRole("button", { name: "Close" }).click();

    await expect(
      page
        .locator('[data-testid="LatestReleases"]')
        .getByText("Album 1", { exact: true })
    ).toBeVisible();

    await expect(
      page.locator('[data-testid="LatestArtists"]').getByText("Artist 1")
    ).toBeVisible();

    await clickMenuItemById(electronApp, "navigate-artists");
    await expect(breadcrumbs.getByText("Artists")).toBeVisible();

    const artistsList = page.locator('[data-testid="LatestArtistsView"]');

    await expect(artistsList.getByText("Artist 1")).toBeVisible();

    await artistsList.getByText("Artist 1").click();
    await expect(
      page.locator('[data-testid="ArtistPageHeader"]').getByText("Artist 1")
    ).toBeVisible();

    const releaseList = page.locator('[data-testid="ReleaseList"]');
    await expect(releaseList).toBeVisible();
    const releaseLink = releaseList
      .getByText("Album 1", { exact: true })
      .first();
    await expect(releaseLink).toBeVisible();
    await releaseLink.click();

    await expect(
      page
        .locator('[data-testid="ReleaseWithTracklistHeader"]')
        .getByText("Album 1")
    ).toBeVisible();

    const tracklist = page.locator('[data-testid="Tracklist-51"]');

    await expect(tracklist).toBeVisible();

    await Promise.all(
      Array.from({ length: 5 }, async (_, i) => {
        await expect(tracklist.getByText(`Track ${pad(i + 1)}`)).toBeVisible();
      })
    );
  });
});
