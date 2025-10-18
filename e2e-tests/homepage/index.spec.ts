import { expect, test } from "@playwright/test";
import { electronApp } from "../electronApp";

test.describe.configure({ mode: "serial" });

test.describe("Homepage", () => {
  test("navigate to the Homepage", async () => {
    const page = await electronApp.firstWindow();
    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Home page").click();
    await expect(page.getByText("Latest Releases")).toBeVisible();
    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Home")
    ).toBeVisible();
  });
});
