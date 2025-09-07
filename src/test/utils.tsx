import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import path from "path";

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

export const send = vi.fn();
