import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { electronApp } from "../electronApp";

test.describe.configure({ mode: "serial" });

test.describe("Edit Collection", () => {
  test("edit the selected Collection", async () => {
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Collections page").click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Collections")
    ).toBeVisible();

    await expect(page.locator('[data-testid="CollectionsPage"]')).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.locator('[data-testid="CollectionPage"]')).toBeVisible();
    await clickMenuItemById(electronApp, "editCollection");

    await expect(
      page.locator(".ReactModalPortal").getByText("Edit Collection").first()
    ).toBeVisible();

    await page
      .getByPlaceholder("Enter the collection title")
      .fill("New Collection Title");
    await page.keyboard.press("Enter");

    await expect(page.locator(".ReactModalPortal")).not.toBeVisible();
    await expect(
      page
        .locator('[data-testid="breadcrumbs"]')
        .getByText("New Collection Title")
    ).toBeInViewport();
  });
});
