import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("QuickSearch", () => {
  test("quick search by given query", async () => {
    const { page, clickMenuItemById } = await getElectronApp();
    await clickMenuItemById("openQuickSearch");
    const input = page.getByPlaceholder("Enter search term");
    await expect(input).toBeFocused();
    await input.fill("Artist");

    const searchResults = page.locator(
      '[data-testid="QuickSearchResultsView"]'
    );

    await Promise.all(
      Array.from(
        { length: 5 },
        async (_, i) =>
          await expect(searchResults).toContainText(`Artist ${i + 1}`)
      )
    );

    await input.fill("Artist 1");

    await expect(
      searchResults.getByRole("link").filter({ hasText: /Artist 1$/ })
    ).toHaveCount(1);
    await expect(
      searchResults.getByRole("link").filter({ hasText: /Artist 10$/ })
    ).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(searchResults).not.toBeVisible();
  });

  test("no results for given query", async () => {
    const { page, clickMenuItemById } = await getElectronApp();
    await clickMenuItemById("openQuickSearch");
    const input = page.getByPlaceholder("Enter search term");
    await expect(input).toBeFocused();
    await input.fill("Nonsense Query");

    const searchResults = page.locator(
      '[data-testid="QuickSearchResultsView"]'
    );

    await expect(searchResults).toContainText(
      'No results for "Nonsense Query"'
    );
  });

  test("navigate the search results", async () => {
    const { page, clickMenuItemById } = await getElectronApp();
    await clickMenuItemById("openQuickSearch");
    const input = page.getByPlaceholder("Enter search term");
    expect(input).toBeFocused();

    await input.fill("Artist");
    const searchResults = page.locator(
      '[data-testid="QuickSearchResultsView"]'
    );
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
