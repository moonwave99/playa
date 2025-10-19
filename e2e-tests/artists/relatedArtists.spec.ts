import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Related Artists", () => {
  test("add a related Artist to current Artist", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Artists")
    ).toBeVisible();

    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByText("Artist 10")
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    await clickMenuItemById(electronApp, "editArtist");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal.getByText("Edit Artist").first()).toBeVisible();

    await modal.getByPlaceholder("Search related Artist").fill("Artist 2");
    await page.waitForTimeout(100);
    await modal.getByLabel("Add Artist 2 to related Artists").click();

    await page.keyboard.press("Escape");

    await expect(page.getByText("Related artists")).toBeVisible();
    await expect(
      page.locator('[data-testid="ArtistPageHeader"]').getByText("Artist 2")
    ).toBeVisible();
  });

  test("remove a related Artist from current Artist", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Artists")
    ).toBeVisible();

    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByText("Artist 10")
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    await page
      .locator('[data-testid="ArtistPageHeader"]')
      .getByText("Artist 2")
      .hover();

    await page
      .locator('[data-testid="ArtistPageHeader"]')
      .getByLabel("Disconnect Artist 2 from Artist 10")
      .click();

    await expect(page.getByText("Related artists")).not.toBeVisible();
    await expect(
      page.locator('[data-testid="ArtistPageHeader"]').getByText("Artist 2")
    ).not.toBeVisible();
  });
});
