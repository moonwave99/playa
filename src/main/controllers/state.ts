import { ReleaseWithArtistAndSubReleases } from "@/types/types";
import type { StateManager } from "../stateManager";

type StateControllerParams = {
  stateManager: StateManager;
  send: (channel: string, ...args: unknown[]) => void;
};

export function stateController({ stateManager, send }: StateControllerParams) {
  return {
    setInputFocused: (inputFocused: boolean) =>
      stateManager.setInputFocused(inputFocused),
    selectReleases: (selection: ReleaseWithArtistAndSubReleases[]) =>
      stateManager.setSelectedReleases(selection),
    navigate: (path: string) => stateManager.setPath(path),
    refreshCurrentArtist: () => stateManager.refreshCurrentArtist(),
    clearSelection: () => send("clearSelection"),
  };
}

export const actions: (keyof ReturnType<typeof stateController>)[] = [
  "setInputFocused",
  "selectReleases",
  "navigate",
  "clearSelection",
  "refreshCurrentArtist",
];
