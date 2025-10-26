import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Containing Collections", () => {
  test("add the current Release to an existing Collection", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoHomePage");

    await expect(page.locator('[data-testid="HomePage"]')).toBeVisible();
    await page.waitForTimeout(100);

    await page.keyboard.press("ArrowRight");
    await clickMenuItemById("gotoReleasePage");

    await expect(page.locator('[data-testid="ReleasePage"]')).toBeVisible();

    await clickMenuItemById("addCurrentReleaseToCollection");
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
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoHomePage");

    await expect(page.locator('[data-testid="HomePage"]')).toBeVisible();

    await page
      .locator('[data-testid="LatestReleases"]')
      .getByRole("listitem")
      .first()
      .click();

    await clickMenuItemById("gotoReleasePage");

    await expect(page.locator('[data-testid="ReleasePage"]')).toBeVisible();

    await clickMenuItemById("addCurrentReleaseToCollection");
    const modal = page.locator(".ReactModalPortal");
    await expect(modal).toContainText("Add Releases to Collection");

    await page.getByLabel("Add to Collection").fill("New Collection");
    await page.waitForTimeout(500);

    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const header = page.locator('[data-testid="ReleaseWithTracklistHeader"]');
    await expect(header).toContainText("New Collection");
    await expect(header).toContainText("Appears in");
  });

  test("removes the current Release from a Collection", async () => {
    const { page, clickMenuItemById } = await getElectronApp();

    await clickMenuItemById("gotoHomePage");
    await expect(page.locator('[data-testid="HomePage"]')).toBeVisible();

    await page
      .locator('[data-testid="LatestReleases"]')
      .getByRole("listitem")
      .first()
      .click();

    await clickMenuItemById("gotoReleasePage");

    await expect(page.locator('[data-testid="ReleasePage"]')).toBeVisible();

    const header = page.locator('[data-testid="ReleaseWithTracklistHeader"]');

    await header.getByText("Collection 1").hover();
    await header.getByLabel("Remove Release 1-5 from Collection 1").click();
    await expect(header).not.toContainText("Collection 1");

    await header.getByText("Collection 2").hover();
    await header.getByLabel("Remove Release 1-5 from Collection 2").click();
    await expect(header).not.toContainText("Collection 2");

    await header.getByText("New Collection").hover();
    await header.getByLabel("Remove Release 1-5 from New Collection").click();
    await expect(header).not.toContainText("New Collection");

    await expect(header).not.toContainText("Appears in");
  });
});
