import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

test.describe.configure({ mode: "serial" });

const getElectronApp = setupElectron();

test.describe("History", () => {
  test("navigates the app history", async () => {
    const { page } = await getElectronApp();

    const backButton = page.getByRole("button", { name: "Go Back" });
    const forwardButton = page.getByRole("button", { name: "Go Forward" });

    expect(backButton).toHaveAttribute("disabled");
    expect(forwardButton).toHaveAttribute("disabled");

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Home page").click();

    await page
      .locator('[data-testid="LatestArtists"]')
      .getByRole("link")
      .filter({ hasText: "Artist 10" })
      .click();

    expect(backButton).not.toHaveAttribute("disabled");
    expect(forwardButton).toHaveAttribute("disabled");

    await expect(page.getByRole("heading").first()).toHaveText("Artist 10");

    await page
      .locator('[data-testid="ReleaseList"]')
      .getByRole("link")
      .filter({ hasText: "Release 10-1" })
      .click();

    await expect(page.getByRole("heading").first()).toHaveText("Release 10-1");

    await backButton.click();

    await expect(page.getByRole("heading").first()).toHaveText("Artist 10");
    expect(backButton).not.toHaveAttribute("disabled");
    expect(forwardButton).not.toHaveAttribute("disabled");

    await forwardButton.click();

    await expect(page.getByRole("heading").first()).toHaveText("Release 10-1");
    expect(backButton).not.toHaveAttribute("disabled");
    expect(forwardButton).toHaveAttribute("disabled");
  });
});
