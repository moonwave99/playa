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
  await cleanup({ id: testId, preserveSettings: true });

  await createAlbum({
    libraryPath: path.join(getE2ETmpPath(testId), "Library"),
    artist: "Artist 1",
    album: `Album 1 CD1`,
  });

  await createAlbum({
    libraryPath: path.join(getE2ETmpPath(testId), "Library"),
    artist: "Artist 1",
    album: `Album 1 CD2`,
  });
});

test.afterAll(async ({}, { testId }) => remove(getE2ETmpPath(testId)));

test.describe("Import", () => {
  test("import multiple folders into library and group them", async () => {
    const { page, clickMenuItemById } = await getElectronApp();
    await clickMenuItemById("gotoHomePage");
    await expect(
      page.getByRole("heading").filter({ hasText: "Latest Releases" })
    ).toBeVisible();

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    await expect(breadcrumbs.getByText("Home")).toBeVisible();

    await clickMenuItemById("importFolder");

    await page.getByRole("button", { name: "Close" }).click();

    const latestReleases = page.locator('[data-testid="LatestReleases"]');

    await expect(
      latestReleases.getByRole("listitem").filter({ hasText: "Album 1 CD1" })
    ).toBeVisible();
    await expect(
      latestReleases.getByRole("listitem").filter({ hasText: "Album 1 CD2" })
    ).toBeVisible();

    await expect(
      page.locator('[data-testid="LatestArtists"]').getByText("Artist 1")
    ).toBeVisible();

    await clickMenuItemById("gotoArtistsPage");
    await expect(breadcrumbs).toContainText("Artists");

    const artistsList = page.locator('[data-testid="LatestArtistsView"]');

    await artistsList
      .getByRole("link")
      .filter({ hasText: "Artist 1" })
      .first()
      .click();

    const artistHeader = page.locator('[data-testid="ArtistPageHeader"]');

    await expect(artistHeader).toContainText("Artist 1");
    await expect(artistHeader).toContainText("2 Releases");

    const releaseList = page.locator('[data-testid="ReleaseList"]');
    await expect(releaseList).toBeVisible();

    await releaseList.getByAltText("Cover of Artist 1 - Album 1 CD1").click();

    await releaseList
      .getByAltText("Cover of Artist 1 - Album 1 CD2")
      .click({ modifiers: ["Meta"] });

    await clickMenuItemById("groupReleases");

    await page.getByRole("button", { name: "Fill Progressively" }).click();
    await page.getByRole("button", { name: "Group Releases" }).click();

    await expect(artistHeader).toContainText("1 Releases");
    const groupedRelease = releaseList
      .getByRole("listitem")
      .filter({ hasText: "Album 1" });
    await expect(groupedRelease).toContainText("2 discs");

    await groupedRelease.getByText("Album 1").first().click();

    const releaseHeader = page.locator(
      '[data-testid="ReleaseWithTracklistHeader"]'
    );

    await expect(releaseHeader).toContainText("Album 1");
    await expect(releaseHeader).toContainText("2 discs");
    await expect(releaseHeader).toContainText("10 Tracks");

    const tracklist = page.locator('[data-testid="Tracklist"]');

    await expect(tracklist).toContainText("Disc 1");
    await expect(tracklist).toContainText("Disc 2");

    await page.goBack();

    await groupedRelease.click();
    await page.waitForTimeout(100);

    await clickMenuItemById("unGroupRelease");

    await expect(
      releaseList.getByRole("listitem").filter({ hasText: "Album 1 CD1" })
    ).toBeVisible();
    await expect(
      releaseList.getByRole("listitem").filter({ hasText: "Album 1 CD2" })
    ).toBeVisible();

    await expect(artistHeader).toContainText("2 Releases");
  });
});
