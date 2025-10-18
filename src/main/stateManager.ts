import { matchPath } from "react-router";
import type { ReleaseWithArtistAndSubReleases } from "@/types/types";
import { getArtist } from "./db/artist";
import { getRelease } from "./db/release";
import { getCollection } from "./db/collection";
import { getGroup } from "./db/group";
import { isPage, getRouteMatch } from "@/renderer/routes";

const getEntityMap = {
  artist: getArtist,
  release: getRelease,
  collection: getCollection,
  group: getGroup,
};

export type State = {
  selectedReleases: ReleaseWithArtistAndSubReleases[];
  isInputFocused: boolean;
  isImporting: boolean;
  path: string;
};

export class StateManager {
  private state: State;
  private handler: (state: State) => void;
  constructor() {
    this.state = {
      selectedReleases: [],
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
  getSelectedReleases(): ReleaseWithArtistAndSubReleases[] {
    return this.state.selectedReleases;
  }
  isInputFocused(): boolean {
    return this.state.isInputFocused;
  }
  isImporting(): boolean {
    return this.state.isImporting;
  }
  onStateChange(handler: (state: State) => void) {
    this.handler = handler;
  }
  setSelectedReleases(selectedReleases: ReleaseWithArtistAndSubReleases[]) {
    this.state.selectedReleases = selectedReleases;
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
  isPage(page: string) {
    return isPage(page, this.state.path);
  }
  async getCurrentEntity() {
    const match = getRouteMatch(this.state.path);
    if (!match || !match.params.id) {
      return null;
    }
    return getEntityMap[match.route.id as keyof typeof getEntityMap](
      +match.params.id
    );
  }
  private onUpdate() {
    if (!this.handler) {
      return;
    }
    this.handler(this.state);
  }
}
