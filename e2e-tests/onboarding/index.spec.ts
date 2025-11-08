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
  test("displays the onboarding if it hasn't been dismissed before", async () => {
    const { page } = await getElectronApp("Onboarding");
    await expect(
      page.getByRole("heading").filter({ hasText: "Welcome to Playa" })
    ).toBeVisible();
  });
});
