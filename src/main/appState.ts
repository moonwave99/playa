import * as fs from 'fs-extra';
import { FileSystemError } from '../errrors';

interface AppStateValues {
  lastOpenedPlaylistId: string;
  lastWindowSize: [number, number];
  lastWindowPosition: [number, number];
}

export default class AppState {
  appState: AppStateValues;
  path: string;
  debug: boolean;
  constructor(path: string, debug: boolean) {
    this.path = path;
    this.debug = debug;
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
      this.appState = fs.readJSONSync(this.path);
      this.debug && console.log(`[AppState] Loaded from ${this.path}...`, this.appState);
    } catch (error) {
      this.appState = {
        lastOpenedPlaylistId: null,
        lastWindowSize: [null, null],
        lastWindowPosition: [null, null]
      };
    }
    return this;
  }
  save(): AppState {
    try {
      console.log(`[AppState] Saving to ${this.path}...`, this.appState);
      fs.outputJSONSync(this.path, this.appState);
    } catch (error) {
      throw new FileSystemError(`[AppState]: error writing to ${this.path}`);
    }
    return this;
  }
}
