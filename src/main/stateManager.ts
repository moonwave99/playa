import { matchPath } from "react-router";
import { SelectableEntities } from "@/types/types";
import { isPage } from "@/renderer/routes";

export type State = {
  selection: Record<SelectableEntities, number[]>;
  isInputFocused: boolean;
  isImporting: boolean;
  path: string;
};

type SelectionSetter = (currentSelection: number[]) => number[];

export class StateManager {
  private state: State;
  private handler: (state: State) => void;
  constructor() {
    this.state = {
      selection: {
        artist: [] as number[],
        release: [] as number[],
        collection: [] as number[],
        group: [] as number[],
        track: [] as number[],
      },
      isInputFocused: false,
      isImporting: false,
      path: "",
    };
  }
  getState(): State {
    return this.state;
  }
  setPath(path: string) {
    this.state.path = path;
    this.onUpdate();
  }
  getSelection(entity: SelectableEntities) {
    return this.state.selection[entity];
  }
  isInputFocused() {
    return this.state.isInputFocused;
  }
  isImporting() {
    return this.state.isImporting;
  }
  reset() {
    this.state = {
      selection: {
        artist: [] as number[],
        release: [] as number[],
        collection: [] as number[],
        group: [] as number[],
        track: [] as number[],
      },
      isInputFocused: false,
      isImporting: false,
      path: "",
    };
    this.onUpdate();
  }
  setSelection(
    entity: SelectableEntities,
    selection: SelectionSetter | number[],
    options?: {
      clearOther: boolean;
    }
  ) {
    if (options?.clearOther) {
      this.state.selection = {
        artist: [] as number[],
        release: [] as number[],
        collection: [] as number[],
        group: [] as number[],
        track: [] as number[],
      };
    }
    this.state.selection[entity] = Array.isArray(selection)
      ? selection
      : selection(this.state.selection[entity]);

    this.onUpdate();
  }
  setInputFocused(isInputFocused: boolean) {
    this.state.isInputFocused = isInputFocused;
    this.onUpdate();
  }
  setImporting(isImporting: boolean) {
    this.state.isImporting = isImporting;
    this.onUpdate();
  }
  onStateChange(handler: (state: State) => void) {
    this.handler = handler;
  }
  getRouteMatch(pattern: string) {
    return matchPath(pattern, this.state.path);
  }
  isPage(page: string) {
    return isPage(page, this.state.path);
  }
  private onUpdate() {
    if (!this.handler) {
      return;
    }
    this.handler(this.state);
  }
}
