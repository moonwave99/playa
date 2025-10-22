import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("Search", () => {
  test("search by given query", async () => {
    const page = await getElectronApp().firstWindow();
    await page.getByRole("button", { name: "Open Search" }).click();
    const input = page.getByPlaceholder("Enter search term");
    expect(input).toBeFocused();

    await input.fill("Artist");

    const searchResults = page.locator('[data-testid="SearchResultsView"]');
    await expect(searchResults).toContainText("Artists (10)");

    Array.from({ length: 5 }, (_, i) =>
      expect(searchResults).toContainText(`Artist ${i + 1}`)
    );

    await input.fill("Artist 1");

    await expect(searchResults).toContainText("Artists (2)");
    await expect(
      searchResults.getByRole("link").filter({ hasText: /Artist 1$/ })
    ).toHaveCount(1);
    await expect(
      searchResults.getByRole("link").filter({ hasText: /Artist 10$/ })
    ).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(searchResults).not.toBeVisible();
  });

  test("navigate the search results", async () => {
    const page = await getElectronApp().firstWindow();
    await page.getByRole("button", { name: "Open Search" }).click();
    const input = page.getByPlaceholder("Enter search term");
    expect(input).toBeFocused();

    await input.fill("Artist");
    const searchResults = page.locator('[data-testid="SearchResultsView"]');
    await expect(searchResults).toContainText("Artists (10)");
    await expect(searchResults).toContainText("Artist 1");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Artists"
    );

    await expect(
      page.locator('[data-testid="ArtistPageHeader"]')
    ).toContainText("Artist 2");
  });
});
