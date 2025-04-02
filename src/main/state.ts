import { BrowserWindow, ipcMain as ipc } from 'electron'
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
      path: ''
    }
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
    this.handler(this.state);
  }
  setCurrentArtist(currentArtist: ArtistWithReleasesFull) {
    this.state.currentArtist = currentArtist;
    this.handler(this.state);
  }
  setInputFocused(isInputFocused: boolean) {
    this.state.isInputFocused = isInputFocused;
    this.handler(this.state);
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
    this.handler(this.state);
  }
}

let manager: StateManager;

export function initStateManager() {
  if (!manager) {
    manager = new StateManager();

    ipc.on('state:setInputFocused', (_, inputFocused) => manager.setInputFocused(inputFocused));
    ipc.on('state:selectReleases',
      (_, selectedReleases) => manager.setSelectedReleases(selectedReleases)
    );
    ipc.on('state:navigate', async (_, path: string) => manager.setPath(path));
    ipc.on('state:clearSelection', () => send('clearSelection'));
    ipc.on('state:toggleSidebar', () => send('toggleSidebar'));
  }
  return manager;
}

export function send(channel: string, ...args: unknown[]) {
  BrowserWindow.getAllWindows()[0].webContents.send(channel, ...args);
}