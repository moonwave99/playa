import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Containing Groups", () => {
  test("add the current Artist to an existing Group", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoArtistsPage");

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Artists"
    );

    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByText("Artist 10")
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    await clickMenuItemById("addCurrentArtistToGroup");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal).toContainText("Add Artists to Group");

    await page.getByLabel("Add to Group").fill("Group 1");
    await page.waitForTimeout(100);

    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    await expect(modal).not.toBeVisible();

    const header = page.locator('[data-testid="ArtistPageHeader"]');

    await expect(header).toContainText("Appears in");
    await expect(header).toContainText("Group 1");
  });

  test("add the current Artist to a new Group", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoArtistsPage");

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Artists"
    );

    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByText("Artist 10")
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    await clickMenuItemById("addCurrentArtistToGroup");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal.getByText("Add Artists to Group").first()).toBeVisible();

    await page.getByLabel("Add to Group").fill("New Group");
    await page.waitForTimeout(100);

    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    await expect(modal).not.toBeVisible();

    const header = page.locator('[data-testid="ArtistPageHeader"]');

    await expect(header).toContainText("Appears in");
    await expect(header).toContainText("New Group");
  });

  test("removes the current Artist from a Group", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoArtistsPage");

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Artists"
    );

    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await page
      .locator('[data-testid="LatestArtistsView"]')
      .getByText("Artist 10")
      .click();

    await expect(page.locator('[data-testid="ArtistPage"]')).toBeVisible();

    const header = page.locator('[data-testid="ArtistPageHeader"]');

    await header.getByText("Group 1").hover();
    await header.getByLabel("Remove Artist 10 from Group 1").click();

    await header.getByText("New Group").hover();
    await header.getByLabel("Remove Artist 10 from New Group").click();

    await expect(header).not.toContainText("Group 1");
    await expect(header).not.toContainText("New Group");
    await expect(header).not.toContainText("Appears in");
  });
});
