import * as fs from 'fs-extra';
import { FileSystemError } from '../errrors';

interface AppStateValues {
  currentPlaylistId: string;
}

export default class AppState {
  appState: AppStateValues;
  path: string;
  constructor(path: string) {
    this.path = path;
  }
  setState(state: object): AppState {
    this.appState = {
      ...this.appState,
      ...state
    };
    return this;
  }
  getState(): AppStateValues {
    return this.appState;
  }
  load(): AppState {
    try {
      console.log(`[AppState] Loading from ${this.path}...`);
      this.appState = fs.readJSONSync(this.path);
    } catch (error) {
      this.appState = {
        currentPlaylistId: null
      };
    }
    return this;
  }
  save(): AppState {
    try {
      console.log(`[AppState] Saving to ${this.path}...`);
      fs.outputJSONSync(this.path, this.appState);
    } catch (error) {
      throw new FileSystemError(`[AppState]: error writing to ${this.path}`);
    }
    return this;
  }
}
