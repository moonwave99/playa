import path from "node:path";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import i18n from "@/renderer/i18n";
import type { Settings } from "@/types/types";

export function withI18n(children: ReactNode) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

const queryClient = new QueryClient();

export function withQueryClientProvider(children: ReactNode) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function withRouter(children: ReactNode) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

const settings = {
  LIBRARY_PATH: "LIBRARY_PATH",
  COVERS_PATH: "COVERS_PATH",
  PLAYER_PATH: "PLAYER_PATH",
  TAGGER_PATH: "TAGGER_PATH",
  DISCOGS_KEY: "DISCOGS_KEY",
  DISCOGS_SECRET: "DISCOGS_SECRET",
  USE_SMART_IMPORT: false,
  SHOW_ONBOARDING_ON_STARTUP: true,
} as const;

export function getSetting(key: keyof Omit<Settings, "id">) {
  return settings[key];
}

export function withPath(key: keyof typeof settings, folderPath: string) {
  return path.join(getSetting(key) as string, folderPath);
}

export function withoutDates<
  T extends { createdAt?: string | Date; updatedAt?: string | Date },
>(x: T): Omit<T, "createdAt" | "updatedAt"> {
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const { createdAt, updatedAt, ...rest } = x;
  return rest;
}

export function getE2ETmpPath(id: string) {
  return path.join(process.cwd(), "e2e-tests", "_tmp", id);
}

type getE2EFolderPathParams = {
  key: string;
  testId: string;
  testTitle: string;
};

export function getE2EFolderPath({
  key,
  testId,
  testTitle,
}: getE2EFolderPathParams) {
  if (key !== "importFolderPath") {
    return [path.join(getE2ETmpPath(testId), key)];
  }
  return testTitle !== "Onboarding Complete"
    ? [path.join(getE2ETmpPath(testId), "LIBRARY_PATH")]
    : [
        path.join(
          getE2ETmpPath(testId),
          "LIBRARY_PATH",
          "A",
          "Artist 1",
          "[Album]",
          "1999 - Album 1"
        ),
      ];
}

export const IS_E2E_TEST = process.env.npm_lifecycle_event === "test:e2e";
export const BUILD_PATH = path.join(
  process.cwd(),
  "out/Playa-darwin-arm64/Playa.app/Contents/Resources"
);
