import { expect, test } from "@playwright/test";
import { electronApp } from "./setup";

test.describe.configure({ mode: "serial" });

test.describe("Main", () => {
  test("renders the Homepage", async () => {
    const page = await electronApp.firstWindow();

    await expect(page.getByText("Latest Releases")).toBeVisible();
    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Home")
    ).toBeVisible();

    Array.from({ length: 5 }, (_, i) =>
      expect(page.getByText(`Release ${i + 1}-5`)).toBeVisible()
    );

    expect(page.getByText("Artist 10")).toBeVisible();
    expect(page.getByText("Artist 9")).toBeVisible();
    expect(page.getByText("Artist 8")).toBeVisible();

    expect(page.getByText("Collection 1")).toBeVisible();
    expect(page.getByText("Collection 2")).toBeVisible();
    expect(page.getByText("Collection 3")).toBeVisible();

    expect(page.getByText("Group 1")).toBeVisible();
    expect(page.getByText("Group 2")).toBeVisible();
    expect(page.getByText("Group 3")).toBeVisible();
  });

  test("navigates to the Releases page", async () => {
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Releases page").click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Releases")
    ).toBeVisible();

    Array.from({ length: 10 }, (_, i) =>
      expect(page.getByText(`Release ${i + 1}-5`)).toBeVisible()
    );
  });

  test("navigates to the Artists page", async () => {
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();
    await page.getByRole("button", { name: "Show latest Artists" }).click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Artists")
    ).toBeVisible();

    Array.from({ length: 9 }, (_, i) =>
      expect(page.getByText(`Artist ${10 - i}`)).toBeInViewport()
    );
  });

  test("toggles Artists View mode", async () => {
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Artists page").click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Artists")
    ).toBeVisible();

    await page.getByRole("button", { name: "Show Artist List" }).click();
    await expect(page.getByText("A (10)")).toBeVisible();
  });
});
