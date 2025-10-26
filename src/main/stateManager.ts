import { matchPath } from "react-router";
import { SelectableEntities } from "@/types/types";
import { isPage } from "@/renderer/routes";

export type State = {
  selection: Record<SelectableEntities, number[]>;
  isInputFocused: boolean;
  isImporting: boolean;
  isNavOpen: boolean;
  isOnboarding: boolean;
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
      isNavOpen: false,
      isImporting: false,
      isOnboarding: false,
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
  isNavOpen() {
    return this.state.isNavOpen;
  }
  isImporting() {
    return this.state.isImporting;
  }
  isOnboarding() {
    return this.state.isOnboarding;
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
      isNavOpen: false,
      isOnboarding: false,
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
  setNavOpen(isNavOpen: boolean) {
    this.state.isNavOpen = isNavOpen;
    this.onUpdate();
  }
  setImporting(isImporting: boolean) {
    this.state.isImporting = isImporting;
    this.onUpdate();
  }
  setOnboarding(isOnboarding: boolean) {
    this.state.isOnboarding = isOnboarding;
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
