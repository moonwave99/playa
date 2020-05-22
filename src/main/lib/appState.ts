import * as fs from 'fs-extra';
import log, { LogContext } from './logger';
import { FileSystemError } from '../../errors';

interface AppStateValues {
  lastOpenedPlaylistId: string;
  lastWindowSize: [number, number];
  lastWindowPosition: [number, number];
  queue: string[];
  volume: number;
  showOnboarding: boolean;
}

export default class AppState {
  appState: AppStateValues;
  path: string;
  constructor(path: string) {
    this.path = path;
  }
  setState(state: object): AppState {
    log({
      context: LogContext.AppState,
      message: 'Updating state'
    }, this.appState, state);
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
      log({
        context: LogContext.AppState,
        message: `Loaded from ${this.path}...`
      }, this.appState);
    } catch (error) {
      this.appState = {
        lastOpenedPlaylistId: null,
        lastWindowSize: [null, null],
        lastWindowPosition: [null, null],
        queue: [],
        volume: 1,
        showOnboarding: true
      };
    }
    return this;
  }
  save(): AppState {
    try {
      fs.outputJSONSync(this.path, this.appState);
      log({
        context: LogContext.AppState,
        message: `Saving to ${this.path}...`
      }, this.appState);
    } catch (error) {
      throw new FileSystemError(`[AppState]: error writing to ${this.path}`);
    }
    return this;
  }
}
