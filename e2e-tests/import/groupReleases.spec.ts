/* eslint-disable no-empty-pattern */
import path from "node:path";
import { remove } from "fs-extra";
import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
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

test.afterAll(async ({}, { testId }) => {
  await remove(getE2ETmpPath(testId));
});

test.describe("Import", () => {
  test("import multiple folders into library and group them", async () => {
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
        .getByText("Album 1 CD1", { exact: true })
    ).toBeVisible();
    await expect(
      page
        .locator('[data-testid="LatestReleases"]')
        .getByText("Album 1 CD2", { exact: true })
    ).toBeVisible();

    await expect(
      page.locator('[data-testid="LatestArtists"]').getByText("Artist 1")
    ).toBeVisible();

    await clickMenuItemById(electronApp, "navigate-artists");
    await expect(breadcrumbs.getByText("Artists")).toBeVisible();

    const artistsList = page.locator('[data-testid="LatestArtistsView"]');

    await expect(artistsList.getByText("Artist 1")).toBeVisible();

    await artistsList.getByText("Artist 1").click();

    const artistHeader = page.locator('[data-testid="ArtistPageHeader"]');

    await expect(artistHeader.getByText("Artist 1")).toBeVisible();
    await expect(artistHeader.getByText("2 Releases")).toBeVisible();

    const releaseList = page.locator('[data-testid="ReleaseList"]');
    await expect(releaseList).toBeVisible();

    await releaseList.getByAltText("Cover of Artist 1 - Album 1 CD1").click();

    await releaseList
      .getByAltText("Cover of Artist 1 - Album 1 CD2")
      .click({ modifiers: ["Meta"] });

    await clickMenuItemById(electronApp, "groupReleases");

    await page.getByRole("button", { name: "Fill Progressively" }).click();
    await page.getByRole("button", { name: "Group Releases" }).click();

    await expect(artistHeader.getByText("1 Releases")).toBeVisible();
    const groupedRelease = releaseList
      .getByRole("listitem")
      .filter({ hasText: "Album 1" });
    await expect(groupedRelease).toContainText("2 discs");

    await groupedRelease.click();
    await page.waitForTimeout(100);

    await clickMenuItemById(electronApp, "unGroupRelease");

    await expect(
      releaseList.getByRole("listitem").filter({ hasText: "Album 1 CD1" })
    ).toBeVisible();
    await expect(
      releaseList.getByRole("listitem").filter({ hasText: "Album 1 CD2" })
    ).toBeVisible();

    await expect(artistHeader.getByText("2 Releases")).toBeVisible();
  });
});
