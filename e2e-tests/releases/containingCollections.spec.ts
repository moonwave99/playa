import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Containing Collections", () => {
  test("add the current Release to an existing Collection", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Home page").click();

    await expect(page.locator('[data-testid="HomePage"]')).toBeVisible();
    await page.waitForTimeout(100);

    await page.keyboard.press("ArrowRight");
    await clickMenuItemById(electronApp, "gotoReleasePage");

    await expect(page.locator('[data-testid="ReleasePage"]')).toBeVisible();

    await clickMenuItemById(electronApp, "addCurrentReleaseToCollection");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal).toContainText("Add Releases to Collection");

    await page.getByLabel("Add to Collection").fill("Collection 1");
    await page.waitForTimeout(100);

    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const header = page.locator('[data-testid="ReleaseWithTracklistHeader"]');
    await expect(header).toContainText("Collection 1");
    await expect(header).toContainText("Appears in");
  });

  test("add the current Release to a new Collection", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Home page").click();

    await expect(page.locator('[data-testid="HomePage"]')).toBeVisible();
    await page.waitForTimeout(100);

    await page.keyboard.press("ArrowRight");
    await clickMenuItemById(electronApp, "gotoReleasePage");

    await expect(page.locator('[data-testid="ReleasePage"]')).toBeVisible();

    await clickMenuItemById(electronApp, "addCurrentReleaseToCollection");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal).toContainText("Add Releases to Collection");

    await page.getByLabel("Add to Collection").fill("New Collection");
    await page.waitForTimeout(100);

    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const header = page.locator('[data-testid="ReleaseWithTracklistHeader"]');
    await expect(header).toContainText("New Collection");
    await expect(header).toContainText("Appears in");
  });

  test("removes the current Release from a Collection", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Home page").click();

    await expect(page.locator('[data-testid="HomePage"]')).toBeVisible();
    await page.waitForTimeout(100);

    await page.keyboard.press("ArrowRight");
    await clickMenuItemById(electronApp, "gotoReleasePage");

    await expect(page.locator('[data-testid="ReleasePage"]')).toBeVisible();

    await page
      .locator('[data-testid="ReleaseWithTracklistHeader"]')
      .getByText("Collection 1")
      .hover();

    await page
      .locator('[data-testid="ReleaseWithTracklistHeader"]')
      .getByLabel("Remove Release 2-5 from Collection 1")
      .click();

    const header = page.locator('[data-testid="ReleaseWithTracklistHeader"]');

    await expect(header).not.toContainText("Collection 1");

    await page
      .locator('[data-testid="ReleaseWithTracklistHeader"]')
      .getByLabel("Remove Release 2-5 from New Collection")
      .click();

    await expect(header).not.toContainText("New Collection");
    await expect(header).not.toContainText("Appears in");
  });
});
