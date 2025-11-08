/* eslint-disable no-empty-pattern */
import { expect, test } from "@playwright/test";
import { setupElectron } from "../electron";
import { cleanup } from "../../src/test/seed";

const getElectronApp = setupElectron();

test.beforeAll(async ({}, { testId }) => {
  await cleanup({
    testId,
    preserveSettings: true,
    enableOnboarding: true,
  });
});

test.describe("Onboarding", () => {
  test("displays the homepage if onboarding is dismissed", async () => {
    const { page } = await getElectronApp("Onboarding");
    await page
      .getByRole("button")
      .filter({ hasText: "Skip Onboarding" })
      .click();
    await expect(
      page.getByRole("heading").filter({ hasText: "Latest Releases" })
    ).toBeVisible();
  });
});
