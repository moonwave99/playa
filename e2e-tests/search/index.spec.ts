import { expect, test } from "@playwright/test";
import { electronApp } from "../electronApp";

test.describe.configure({ mode: "serial" });

test.describe("Search", () => {
  test("displays the search results for the given query", async () => {
    const page = await electronApp.firstWindow();
    await page.getByRole("button", { name: "Open Search" }).click();
    const input = page.getByPlaceholder("Enter search term");
    expect(input).toBeVisible();
    expect(input).toBeFocused();

    await input.fill("Artist");

    await expect(page.getByText("Artists (10)")).toBeInViewport();

    Array.from({ length: 5 }, (_, i) =>
      expect(
        page
          .locator('[data-testid="SearchResultsView-artist"]')
          .getByText(`Artist ${i + 1}`, { exact: true })
      ).toBeInViewport()
    );

    await input.fill("Artist 1");

    await expect(page.getByText("Artists (2)")).toBeInViewport();

    expect(
      page
        .locator('[data-testid="SearchResultsView-artist"]')
        .getByText(`Artist 1`, { exact: true })
    ).toBeInViewport();

    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder("Enter search term")).not.toBeVisible();
  });

  test("it navigates the search results", async () => {
    const page = await electronApp.firstWindow();
    await page.getByRole("button", { name: "Open Search" }).click();
    const input = page.getByPlaceholder("Enter search term");
    expect(input).toBeVisible();
    expect(input).toBeFocused();

    await input.fill("Artist");

    await expect(page.getByText("Artists (10)")).toBeInViewport();
    await expect(
      page
        .locator('[data-testid="SearchResultsView-artist"]')
        .getByText("Artist 1", { exact: true })
    ).toBeInViewport();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Artists")
    ).toBeVisible();

    await expect(
      page.locator('[data-testid="ArtistPageHeader"]').getByText("Artist 2")
    ).toBeInViewport();
  });
});
