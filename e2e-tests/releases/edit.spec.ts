import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { electronApp } from "../electronApp";

import { seed } from "../../src/test/seed";

test.beforeEach(async () => {
  await seed();
});

test.describe.configure({ mode: "serial" });

test.describe("Releases", () => {
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

  test("edit the selected release", async () => {
    const page = await electronApp.firstWindow();

    await page.getByRole("button", { name: "Toggle Menu" }).click();
    await page.getByLabel("Go to the Releases page").click();

    await expect(
      page.locator('[data-testid="breadcrumbs"]').getByText("Releases")
    ).toBeVisible();

    await clickMenuItemById(electronApp, "editRelease");
    await expect(page.getByText("Edit Release").first()).toBeInViewport();

    await expect(
      page.locator(".ReactModalPortal").getByText("Release 1-5")
    ).toBeInViewport();

    await page.getByPlaceholder("Enter title").fill("New Release Title");
    await page.keyboard.press("Enter");

    await expect(page.locator(".ReactModalPortal")).not.toBeVisible();
    await expect(page.getByText("New Release Title").first()).toBeVisible();
  });
});
