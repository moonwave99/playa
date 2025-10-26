/* eslint-disable no-empty-pattern */
import path from "node:path";
import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { cleanup } from "../../src/test/seed";
import { createAlbum } from "../../src/test/tracks";
import { getE2ETmpPath } from "../../src/test/utils";

const getElectronApp = setupElectron();

test.beforeAll(async ({}, { testId }) => {
  await cleanup({
    id: testId,
    preserveSettings: true,
    enableOnboarding: true,
  });

  await createAlbum({
    libraryPath: path.join(getE2ETmpPath(testId), "LIBRARY_PATH"),
    artist: "Artist 1",
    album: "Album 1",
  });
});

test.describe("Onboarding Complete", () => {
  test("goes through the complete onboarding process", async ({}, {
    testId,
  }) => {
    const { page, clickMenuItemById } = await getElectronApp("Onboarding");

    // first step
    await expect(
      page.getByRole("heading").filter({ hasText: "Welcome to Playa" })
    ).toBeVisible();

    await page
      .getByRole("button")
      .filter({ hasText: "Start onboarding" })
      .click();

    // second step
    await page
      .getByRole("button")
      .filter({ hasText: "Locate your Library" })
      .click();

    await expect(
      page.getByPlaceholder("Choose a location for your Library")
    ).toBeVisible();

    await page.getByRole("button").filter({ hasText: "Next step" }).click();

    // third step
    await expect(
      page.getByRole("heading").filter({ hasText: "Select Applications" })
    ).toBeVisible();

    await page
      .getByRole("button")
      .filter({ hasText: "Locate your Player" })
      .click();

    await expect(
      page.getByPlaceholder("Choose a location for your Player")
    ).toBeVisible();

    await page
      .getByRole("button")
      .filter({ hasText: "Locate your Tagger" })
      .click();

    await expect(
      page.getByPlaceholder("Choose a location for your Tagger")
    ).toBeVisible();

    await page.getByRole("button").filter({ hasText: "Next step" }).click();

    // fourth step
    await expect(
      page
        .getByRole("heading")
        .filter({ hasText: "Share your Discogs API keys" })
    ).toBeVisible();

    await page
      .getByPlaceholder("Enter your Discogs API Key")
      .fill("DISCOGS_API_KEY");
    await page
      .getByPlaceholder("Enter your Discogs API Secret")
      .fill("DISCOGS_API_SECRET");

    await page.getByRole("button").filter({ hasText: "Next step" }).click();

    // fifth step
    await page
      .getByRole("button")
      .filter({ hasText: "Import a Folder" })
      .click();

    await page.getByRole("button").filter({ hasText: "Import Folder" }).click();

    await expect(page.locator('[data-testid="ReleaseList"]')).toContainText(
      "Artist 1"
    );

    await page
      .getByRole("button")
      .filter({ hasText: "Complete Onboarding" })
      .click();

    // sixth step
    await expect(
      page.getByRole("heading").filter({ hasText: "We are done here!" })
    ).toBeVisible();
    await page.getByRole("button").filter({ hasText: "Go to Library" }).click();

    // go to homepage
    await expect(page.locator(`[data-testid="App"]`)).toBeVisible();

    await expect(
      page
        .locator(`[data-testid="LatestReleases"]`)
        .getByRole("listitem")
        .filter({ hasText: "Album 1" })
    ).toHaveCount(1);

    await expect(
      page
        .locator(`[data-testid="LatestArtists"]`)
        .getByRole("listitem")
        .filter({ hasText: "Artist 1" })
    ).toHaveCount(1);

    // check settings
    await clickMenuItemById("openSettings");

    const modal = page.locator(".ReactModalPortal");
    await expect(
      modal.getByRole("heading").filter({ hasText: "Setting" })
    ).toBeVisible();

    Object.entries({
      [path.join(getE2ETmpPath(testId), "LIBRARY_PATH")]:
        "Insert the folder where your music is located",
      [path.join(getE2ETmpPath(testId), "PLAYER_PATH")]:
        "Insert the location of your Player App",
      [path.join(getE2ETmpPath(testId), "TAGGER_PATH")]:
        "Insert the location of your Tagger App",
      DISCOGS_API_KEY: "Insert your Discogs API key",
      DISCOGS_API_SECRET: "Insert your Discogs API Secret",
    }).forEach(([value, placeholder]) =>
      expect(modal.getByPlaceholder(placeholder)).toHaveValue(value)
    );
  });
});
