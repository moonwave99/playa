import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Homepage", () => {
  test("navigate to the Homepage", async () => {
    const { page } = await getElectronApp();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Home page").click();
    await expect(
      page.getByRole("heading").filter({ hasText: "Latest Releases" })
    ).toBeVisible();

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Home"
    );
  });
});
