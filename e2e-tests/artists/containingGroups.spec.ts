import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Containing Groups", () => {
  test("add the current Artist to a Group", async () => {
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

  test("removes the current Artist from a Group", async () => {
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
      .getByText("Group 1")
      .hover();

    await page
      .locator('[data-testid="ArtistPageHeader"]')
      .getByLabel("Remove Artist 10 from Group 1")
      .click();

    await expect(page.getByText("Appears in")).not.toBeVisible();
    await expect(
      page.locator('[data-testid="ArtistPageHeader"]').getByText("Group 1")
    ).not.toBeVisible();
  });
});
