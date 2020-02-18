import mockFs from 'mock-fs';
import AppState from './appState';

describe('appState', () => {
  afterAll(() => {
    mockFs.restore();
  });
  const path = '/path/to/state.json';

  it('should set and get state', () => {
    mockFs({
      [path]: '{}'
    });
    const appState = new AppState(path);
    const state = {
      lastOpenedPlaylistId: '123',
      queue: ['1', '2', '3'],
      volume: 0.5
    };
    appState.setState(state);
    expect(appState.getState()).toEqual(state);
  });

  it('should load state from disk', () => {
    const state = {
      lastOpenedPlaylistId: '123',
      queue: ['1', '2', '3'],
      volume: 0.5
    };
    mockFs({
      [path]: JSON.stringify(state)
    });
    const appState = new AppState(path);
    appState.load();
    expect(appState.getState()).toEqual(state);
  });

  it('should save state to disk', () => {
    mockFs({
      [path]: '{}'
    });
    const state = {
      lastOpenedPlaylistId: '123',
      queue: ['1', '2', '3'],
      volume: 0.5
    };
    const appState = new AppState(path);
    appState.load();
    expect(appState.getState()).toEqual({});
    appState.setState(state);
    appState.save();
    appState.load();
    expect(appState.getState()).toEqual(state);
  });
});
