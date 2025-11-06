import path from "node:path";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import i18n from "@/renderer/i18n";
import type { Settings } from "@/types/types";

export { IS_E2E_TEST, getE2EFolderPath, getE2ETmpPath } from "./e2e";

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

export const BUILD_PATH = path.join(
  process.cwd(),
  "out/Playa-darwin-arm64/Playa.app/Contents/Resources"
);
