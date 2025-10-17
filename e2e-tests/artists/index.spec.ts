import { expect, test } from "@playwright/test";
import { electronApp } from "../electronApp";

test.describe.configure({ mode: "serial" });

test.describe("Artists Page", () => {
  test("navigate to the Artists page", async () => {
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();
    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Artists")
    ).toBeVisible();
  });

  test("toggle Artists View mode", async () => {
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Artists")
    ).toBeVisible();

    await page.getByRole("button", { name: "Show Artist List" }).click();
    await expect(page.getByText("A (10)")).toBeInViewport();
  });
});
