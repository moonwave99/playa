import { matchPath } from 'react-router';
import type { ReleaseWithArtistAndSubreleases, ArtistWithReleasesFull } from '@/types/types';
import { getArtist } from './db/artist';

export type State = {
  selectedReleases: ReleaseWithArtistAndSubreleases[];
  currentArtist: ArtistWithReleasesFull;
  isInputFocused: boolean;
  path: string;
}

export class StateManager {
  private state: State;
  private handler: (state: State) => void;
  constructor() {
    this.state = {
      selectedReleases: [],
      currentArtist: null,
      isInputFocused: false,
      path: '',
    };
  }
  getState(): State {
    return this.state;
  }
  getCurrentArtist(): ArtistWithReleasesFull {
    return this.state.currentArtist;
  }
  getSelectedReleases(): ReleaseWithArtistAndSubreleases[] {
    return this.state.selectedReleases;
  }
  isInputFocused(): boolean {
    return this.state.isInputFocused;
  }
  onStateChange(handler: (state: State) => void) {
    this.handler = handler;
  }
  setSelectedReleases(selectedReleases: ReleaseWithArtistAndSubreleases[]) {
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
  isSingleArtistPage() {
    const artistMatch = matchPath('/artists/:id', this.state.path);
    return +artistMatch?.params.id;
  }
  async setPath(path: string) {
    const artistMatch = matchPath('/artists/:id', path);
    this.state.path = path;
    const id = this.isSingleArtistPage();
    if (id) {
      this.state.currentArtist = await getArtist(+artistMatch.params.id);
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
}