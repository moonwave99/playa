import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import path from "path";
import i18n from "@/renderer/i18n";

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
  PLAYER_PATH: "PLAYER_PATH",
  TAGGER_PATH: "TAGGER_PATH",
  DISCOGS_KEY: "DISCOGS_KEY",
  DISCOGS_SECRET: "DISCOGS_SECRET",
  LIBRARY_PATH: "LIBRARY_PATH",
  COVERS_PATH: "COVERS_PATH",
} as const;

export function getSetting(key: keyof typeof settings) {
  return settings[key];
}

export function withPath(key: keyof typeof settings, folderPath: string) {
  return path.join(getSetting(key), folderPath);
}

export function withoutDates<T>(
  x: T & { createdAt: string | Date; updatedAt: string | Date }
): Omit<T, "createdAt" | "updatedAt"> {
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
