import type { StateManager } from "../stateManager";

type StateControllerParams = {
  stateManager: StateManager;
  send: (channel: string, ...args: unknown[]) => void;
};

export function stateController({ stateManager, send }: StateControllerParams) {
  return {
    setInputFocused: (inputFocused: boolean) =>
      stateManager.setInputFocused(inputFocused),
    setOnboarding: (isOnboarding: boolean) =>
      stateManager.setOnboarding(isOnboarding),
    setNavOpen: (isNavOpen: boolean) => stateManager.setNavOpen(isNavOpen),
    setSelection: (...params: Parameters<typeof stateManager.setSelection>) =>
      stateManager.setSelection(...params),
    navigate: (path: string) => stateManager.setPath(path),
    clearSelection: () => send("clearSelection"),
  };
}

export const actions: (keyof ReturnType<typeof stateController>)[] = [
  "setInputFocused",
  "setOnboarding",
  "setNavOpen",
  "setSelection",
  "navigate",
  "clearSelection",
];
