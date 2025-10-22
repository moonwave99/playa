import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";

const getElectronApp = setupElectron();

test.describe("Delete Group", () => {
  test("delete the selected Group", async () => {
    const electronApp = getElectronApp();
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Groups page").click();

    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText(
      "Groups"
    );

    await expect(page.locator('[data-testid="GroupsPage"]')).toBeVisible();
    await page.keyboard.down("Meta");
    await page.keyboard.press("Backspace");
    await page.keyboard.up("Meta");

    await expect(page.locator('[data-testid="GroupsList"]')).not.toContainText(
      "Group 1"
    );
  });
});
