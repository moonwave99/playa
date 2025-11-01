import { matchPath } from "react-router";
import { SelectableEntities } from "@/types/types";
import { isPage } from "@/renderer/routes";

export type State = {
  selection: Record<SelectableEntities, number[]>;
  isInputFocused: boolean;
  isImporting: boolean;
  isNavOpen: boolean;
  isOnboarding: boolean;
  isModalOpen: boolean;
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
      isModalOpen: false,
      path: "",
    };
  }
  set<T extends keyof State>(key: T, value: State[T]) {
    this.state[key] = value;
    this.onUpdate();
  }
  get<T extends keyof State>(key: T): State[T] {
    return this.state[key];
  }
  getState(): State {
    return this.state;
  }
  isInputFocused() {
    return this.get("isInputFocused");
  }
  setInputFocused(isInputFocused: boolean) {
    this.set("isInputFocused", isInputFocused);
  }
  isNavOpen() {
    return this.get("isNavOpen");
  }
  setNavOpen(isNavOpen: boolean) {
    this.set("isNavOpen", isNavOpen);
  }
  isImporting() {
    return this.get("isImporting");
  }
  setImporting(isImporting: boolean) {
    this.set("isImporting", isImporting);
  }
  isOnboarding() {
    return this.get("isOnboarding");
  }
  setOnboarding(isOnboarding: boolean) {
    this.set("isOnboarding", isOnboarding);
  }
  isModalOpen() {
    return this.get("isModalOpen");
  }
  setModalOpen(isModalOpen: boolean) {
    this.set("isModalOpen", isModalOpen);
  }
  getSelection(entity: SelectableEntities) {
    return this.state.selection[entity];
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
  setPath(path: string) {
    this.set("path", path);
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
      isModalOpen: false,
      path: "",
    };
    this.onUpdate();
  }
  private onUpdate() {
    if (!this.handler) {
      return;
    }
    this.handler(this.state);
  }
}
