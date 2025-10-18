import { matchPath } from "react-router";
import type {
  ReleaseWithArtistAndSubReleases,
  ArtistWithReleasesFull,
} from "@/types/types";
import { getArtist } from "./db/artist";
import { isPage } from "@/renderer/routes";

export type State = {
  selectedReleases: ReleaseWithArtistAndSubReleases[];
  currentArtist: ArtistWithReleasesFull;
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
      currentArtist: null,
      isInputFocused: false,
      isImporting: false,
      path: "",
    };
  }
  getState(): State {
    return this.state;
  }
  getCurrentArtist(): ArtistWithReleasesFull {
    return this.state.currentArtist;
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
  setCurrentArtist(currentArtist: ArtistWithReleasesFull) {
    this.state.currentArtist = currentArtist;
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
  async setPath(path: string) {
    this.state.path = path;
    const { params } = this.isPage("artist");
    if (params?.id) {
      this.state.currentArtist = (await getArtist(
        +params.id
      )) as ArtistWithReleasesFull;
    } else {
      this.state.currentArtist = null;
    }
    this.onUpdate();
  }
  private onUpdate() {
    if (!this.handler) {
      return;
    }
    this.handler(this.state);
  }
  async refreshCurrentArtist() {
    if (!this.state.currentArtist?.id) {
      return;
    }
    this.setCurrentArtist(
      (await getArtist(
        this.state.currentArtist.id
      )) as unknown as ArtistWithReleasesFull
    );
  }
  isPage(page: string) {
    return isPage(page, this.state.path);
  }
}
