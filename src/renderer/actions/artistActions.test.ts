import { IpcMock } from '../../../test/mockIpc';
const ipcRenderer = new IpcMock();

jest.mock('electron', () => ({
  ipcRenderer
}));

import { artists } from '../../../test/testFixtures';

import {
  searchOnRYMAction,
  searchOnDiscogsAction,
  searchOnYoutubeAction,
  getActionGroups,
  ArtistActionsGroups,
  ARTIST_CONTEXT_ACTIONS
} from './artistActions';

import { IPC_MESSAGES, SEARCH_URLS } from '../../constants';
const { IPC_SYS_OPEN_URL } = IPC_MESSAGES;

describe('artistActions', () => {
  describe('searchOnRYMAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = searchOnRYMAction({
        artist: artists[0]
      });
      expect(title).toBe('Search artist on rateyourmusic');
      expect(typeof handler).toBe('function');
      handler();
      expect(ipcRenderer.send)
        .toHaveBeenCalledWith(IPC_SYS_OPEN_URL, SEARCH_URLS.RYM_ARTIST, artists[0].name);
    });
  });

  describe('searchOnDiscogsAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = searchOnDiscogsAction({
        artist: artists[0]
      });
      expect(title).toBe('Search artist on Discogs');
      expect(typeof handler).toBe('function');
      handler();
      expect(ipcRenderer.send)
        .toHaveBeenCalledWith(IPC_SYS_OPEN_URL, SEARCH_URLS.DISCOGS, artists[0].name);
    });
  });

  describe('searchOnYoutubeAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = searchOnYoutubeAction({
        artist: artists[0]
      });
      expect(title).toBe('Search artist on Youtube');
      expect(typeof handler).toBe('function');
      handler();
      expect(ipcRenderer.send)
        .toHaveBeenCalledWith(IPC_SYS_OPEN_URL, SEARCH_URLS.YOUTUBE, artists[0].name);
    });
  });
});

describe('getActionGroups', () => {
  it('should return an array of MenuItemConstructorOptions by given actionGroups', () => {
    const actionGroups = getActionGroups({
      actionGroups: [ArtistActionsGroups.SEARCH_ONLINE],
      type: ARTIST_CONTEXT_ACTIONS,
      artist: artists[0]
    });

    expect(actionGroups.map(({ label }) => label)).toEqual(
      [
        searchOnRYMAction({ artist: artists[0] }),
        searchOnDiscogsAction({ artist: artists[0] }),
        searchOnYoutubeAction({ artist: artists[0] })
      ].map(({ title }) => title )
    );
  });
});
