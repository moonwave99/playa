import { SelectableEntities } from "@/types/types";
import type { StateManager } from "../stateManager";

type StateControllerParams = {
  stateManager: StateManager;
  send: (channel: string, ...args: unknown[]) => void;
};

export function stateController({ stateManager, send }: StateControllerParams) {
  return {
    setInputFocused: (inputFocused: boolean) =>
      stateManager.setInputFocused(inputFocused),
    setSelection: (entity: SelectableEntities, selection: number[]) =>
      stateManager.setSelection(entity, selection),
    navigate: (path: string) => stateManager.setPath(path),
    clearSelection: () => send("clearSelection"),
  };
}

export const actions: (keyof ReturnType<typeof stateController>)[] = [
  "setInputFocused",
  "setSelection",
  "navigate",
  "clearSelection",
];
