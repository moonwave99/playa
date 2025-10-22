import { matchPath } from "react-router";
import { SelectableEntities } from "@/types/types";

export type State = {
  selection: Record<SelectableEntities, number[]>;
  isInputFocused: boolean;
  isImporting: boolean;
  path: string;
};

export class StateManager {
  private state: State;
  private handler: (state: State) => void;
  constructor() {
    this.state = {
      selection: {
        artist: [],
        release: [],
        collection: [],
        group: [],
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
  onStateChange(handler: (state: State) => void) {
    this.handler = handler;
  }
  setSelection(entity: SelectableEntities, selection: number[]) {
    this.state.selection[entity] = selection;
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
  getRouteMatch(pattern: string) {
    return matchPath(pattern, this.state.path);
  }
  private onUpdate() {
    if (!this.handler) {
      return;
    }
    this.handler(this.state);
  }
}
