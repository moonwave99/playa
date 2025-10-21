import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Containing Groups", () => {
  test("add the current Artist to an existing Group", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Artists"
    );

    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByText("Artist 10")
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    await clickMenuItemById(electronApp, "addArtistToGroup");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal.getByText("Add Artists to Group").first()).toBeVisible();

    await page.getByLabel("Add to Group").fill("Group 1");
    await page.waitForTimeout(100);

    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    await expect(page.getByText("Appears in")).toBeVisible();
    await expect(
      page.locator('[data-testid="ArtistPageHeader"]').getByText("Group 1")
    ).toBeVisible();
  });

  test("add the current Artist to a new Group", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Artists"
    );

    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByText("Artist 10")
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    await clickMenuItemById(electronApp, "addArtistToGroup");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal.getByText("Add Artists to Group").first()).toBeVisible();

    await page.getByLabel("Add to Group").fill("New Group");
    await page.waitForTimeout(100);

    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    await expect(page.getByText("Appears in")).toBeVisible();
    await expect(
      page.locator('[data-testid="ArtistPageHeader"]').getByText("New Group")
    ).toBeVisible();
  });

  test("removes the current Artist from a Group", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Artists"
    );

    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByText("Artist 10")
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    const artistHeader = page.locator('[data-testid="ArtistPageHeader"]');

    await artistHeader.getByText("Group 1").hover();
    await artistHeader.getByLabel("Remove Artist 10 from Group 1").click();

    await artistHeader.getByText("New Group").hover();
    await page
      .locator('[data-testid="ArtistPageHeader"]')
      .getByLabel("Remove Artist 10 from New Group")
      .click();

    await expect(artistHeader).not.toContainText("Group 1");
    await expect(artistHeader).not.toContainText("New Group");
    await expect(artistHeader).not.toContainText("Appears in");
  });
});
