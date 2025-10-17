import { expect, test } from "@playwright/test";
import { electronApp } from "../electronApp";

test.describe.configure({ mode: "serial" });

test.describe("Releases", () => {
  test("navigate to the Releases list", async () => {
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Releases page").click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Releases")
    ).toBeVisible();

    await page
      .locator('[data-testid="ReleasesPage"]')
      .getByAltText("Cover of Artist 2 - Release 2-5")
      .click();

    await expect(
      page
        .locator('[data-testid="ReleasesPage"]')
        .locator('[data-hasfocus="true"]', { hasText: "Release 2-5" })
    ).toBeVisible();

    await page.keyboard.press("ArrowRight");

    await expect(
      page
        .locator('[data-testid="ReleasesPage"]')
        .locator('[data-hasfocus="true"]', { hasText: "Release 3-5" })
    ).toBeVisible();
  });
});
