import { Send } from "@/types/types";
import type { StateManager } from "../stateManager";
import type { History, HistoryEntry } from "../history";

type StateControllerParams = {
  stateManager: StateManager;
  history: History;
  send: Send;
};

export function stateController({
  stateManager,
  history,
  send,
}: StateControllerParams) {
  return {
    setInputFocused: (inputFocused: boolean) =>
      stateManager.setInputFocused(inputFocused),
    setOnboarding: (isOnboarding: boolean) =>
      stateManager.setOnboarding(isOnboarding),
    setNavOpen: (isNavOpen: boolean) => stateManager.setNavOpen(isNavOpen),
    setModalOpen: (isModalOpen: boolean) =>
      stateManager.setModalOpen(isModalOpen),
    setSelection: (...params: Parameters<typeof stateManager.setSelection>) =>
      stateManager.setSelection(...params),
    clearSelection: () => send("clearSelection"),
    navigate: (historyEntry: HistoryEntry) => {
      if (
        history.getState().currentEntry?.href.startsWith("/search") &&
        historyEntry.href.startsWith("/search")
      ) {
        history.replace(historyEntry);
        return;
      }
      history.push(historyEntry);
    },
    goBack: () => history.goBack(),
    goForward: () => history.goForward(),
  };
}

export const actions: (keyof ReturnType<typeof stateController>)[] = [
  "setInputFocused",
  "setOnboarding",
  "setNavOpen",
  "setModalOpen",
  "setSelection",
  "clearSelection",
  "navigate",
  "goBack",
  "goForward",
];
