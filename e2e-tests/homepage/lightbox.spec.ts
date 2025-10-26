import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Homepage", () => {
  test("open current Release in lightbox", async () => {
    const { page } = await getElectronApp();
    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Home page").click();

    await expect(
      page.getByRole("heading").filter({ hasText: "Latest Releases" })
    ).toBeVisible();

    await page
      .locator('[data-testid="LatestReleases"]')
      .getByRole("listitem")
      .first()
      .click();

    await page.keyboard.press("Space");

    const lightbox = page.locator('[data-testid="ReleaseLightbox"]');
    await expect(lightbox).toBeVisible();

    await expect(lightbox).toContainText("Release 1-5");

    await page.keyboard.press("ArrowRight");
    await expect(lightbox).toContainText("Release 2-5");

    await page.keyboard.press("ArrowRight");
    await expect(lightbox).toContainText("Release 3-5");

    await page.keyboard.press("ArrowLeft");
    await expect(lightbox).toContainText("Release 2-5");

    await page.keyboard.press("ArrowLeft");
    await expect(lightbox).toContainText("Release 1-5");

    await page.keyboard.press("Escape");
    await expect(lightbox).not.toBeVisible();

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    await expect(lightbox).toBeVisible();

    await expect(lightbox).toContainText("Release 2-5");
  });
});
