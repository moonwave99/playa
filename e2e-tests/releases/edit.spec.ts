import { expect, test } from "@playwright/test";
import { clickMenuItemById } from "electron-playwright-helpers";
import { electronApp } from "../electronApp";

test.describe.configure({ mode: "serial" });

test.describe("Edit Release", () => {
  test("edit the selected Release", async () => {
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
    await page.getByPlaceholder("Enter year").fill("2999");
    await page.getByLabel("Release type").selectOption("Compilation");

    await page.keyboard.press("Enter");

    await expect(page.locator(".ReactModalPortal")).not.toBeVisible();

    await expect(page.getByText("New Release Title").first()).toBeVisible();
    await expect(page.getByText("2999").first()).toBeVisible();
    await expect(page.getByText("Compilation").first()).toBeVisible();
  });
});
