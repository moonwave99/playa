import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { toObj } from '../utils/storeUtils';
import { albums, tracks } from '../../../test/testFixtures';

import {
  ALBUM_GET_CONTENT_RESPONSE
} from '../store/modules/album';

import {
  TRACK_GET_LIST_RESPONSE
} from '../store/modules/track';

import {
  PLAYER_UPDATE_QUEUE,
  PLAYER_PLAY_TRACK
} from '../store/modules/player';

import {
  playAlbumAction,
  enqueueAfterCurrentAction,
  enqueueAtEndAction,
  removeFromQueueAction,
  revealInFinderAction,
  reloadAlbumContentAction,
  searchOnRYMAction,
  searchOnDiscogsAction,
  searchOnYoutubeAction
} from './albumActions';

describe('albumActions', () => {
  describe('playAlbumAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = playAlbumAction({ albums: [albums[0]] });
      expect(title).toBe(`Play '${albums[0].artist} - ${albums[0].title}'`);
      expect(typeof handler).toBe('function');
    });

    it('should dispatch expected actions', async () => {
      const store = mockStore({
        player: {
          queue: []
        },
        albums: {
          allById: toObj(albums)
        },
        tracks: {
          allById: toObj(tracks)
        },
        covers: {
          allById: {}
        }
      });
      const album = {
        ...albums[0],
        tracks: ['1', '2']
      }
      const { handler } = playAlbumAction({
        albums: [album],
        queue: [album._id],
        trackId: '1',
        playlistId: '1',
        dispatch: store.dispatch
      });
      await handler();
      const expectedActions = [{
        type: PLAYER_UPDATE_QUEUE,
        queue: [album._id]
      },
      {
        type: PLAYER_PLAY_TRACK,
        playlistId: '1',
        albumId: album._id,
        trackId: '1'
      }];
      expectedActions.forEach(
        action => expect(store.getActions()).toContainEqual(action)
      );
    });
  });

  describe('enqueueAfterCurrentAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = enqueueAfterCurrentAction({ albums: [albums[0]] });
      expect(title).toBe(`Enqueue after current album`);
      expect(typeof handler).toBe('function');
    });

    it('should dispatch expected actions', async () => {
      const store = mockStore({
        player: {
          queue: ['2', '3'],
          currentAlbumId: '2'
        },
        albums: {
          allById: toObj(albums)
        },
        tracks: {
          allById: toObj(tracks)
        },
        covers: {
          allById: {}
        }
      });
      const album = albums[0];
      const { handler } = enqueueAfterCurrentAction({
        albums: [album],
        dispatch: store.dispatch
      });
      await handler();
      const expectedActions = [{
        type: PLAYER_UPDATE_QUEUE,
        queue: ['2', album._id, '3']
      }];
      expectedActions.forEach(
        action => expect(store.getActions()).toContainEqual(action)
      );
    });
  });

  describe('enqueueAtEndAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = enqueueAtEndAction({ albums: [albums[0]] });
      expect(title).toBe(`Enqueue at the end`);
      expect(typeof handler).toBe('function');
    });

    it('should dispatch expected actions', async () => {
      const store = mockStore({
        player: {
          queue: ['2', '3'],
          currentAlbumId: '2'
        },
        albums: {
          allById: toObj(albums)
        },
        tracks: {
          allById: toObj(tracks)
        },
        covers: {
          allById: {}
        }
      });
      const album = albums[0];
      const { handler } = enqueueAtEndAction({
        albums: [album],
        dispatch: store.dispatch
      });
      await handler();
      const expectedActions = [{
        type: PLAYER_UPDATE_QUEUE,
        queue: ['2', '3', album._id]
      }];
      expectedActions.forEach(
        action => expect(store.getActions()).toContainEqual(action)
      );
    });
  });

  describe('removeFromQueueAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = removeFromQueueAction({ albums: [albums[0]], queue: [] });
      expect(title).toBe(`Remove from queue`);
      expect(typeof handler).toBe('function');
    });

    it('should dispatch expected actions', async () => {
      const store = mockStore({
        player: {
          queue: ['2', '3'],
          currentAlbumId: '2'
        },
        albums: {
          allById: toObj(albums)
        },
        tracks: {
          allById: toObj(tracks)
        },
        covers: {
          allById: {}
        }
      });
      const album = albums[0];
      const { handler } = removeFromQueueAction({
        albums: [album],
        queue: ['1', '2', '3'],
        dispatch: store.dispatch
      });
      await handler();
      const expectedActions = [{
        type: PLAYER_UPDATE_QUEUE,
        queue: ['2', '3']
      }];
      expectedActions.forEach(
        action => expect(store.getActions()).toContainEqual(action)
      );
    });
  });

  describe('revealInFinderAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = revealInFinderAction({ albums: [albums[0]] });
      expect(title).toBe(`Reveal '${albums[0].artist} - ${albums[0].title}' in Finder`);
      expect(typeof handler).toBe('function');
    });
  });

  describe('reloadAlbumContentAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = reloadAlbumContentAction({ albums: [albums[0]] });
      expect(title).toBe(`Reload '${albums[0].artist} - ${albums[0].title}' tracks`);
      expect(typeof handler).toBe('function');
    });

    it('should dispatch expected actions', async () => {
      const store = mockStore({
        player: {
          queue: ['2', '3'],
          currentAlbumId: '2'
        },
        albums: {
          allById: toObj(albums)
        },
        tracks: {
          allById: toObj(tracks)
        },
        covers: {
          allById: {}
        }
      });
      const album = albums[0];
      const { handler } = reloadAlbumContentAction({
        albums: [album],
        dispatch: store.dispatch
      });
      await handler();
      const expectedActions = [{
        type: TRACK_GET_LIST_RESPONSE,
        results: [tracks[0], tracks[1]]
      },
      {
        type: ALBUM_GET_CONTENT_RESPONSE,
        album: { ...album, tracks: [tracks[0], tracks[1]].map(({ _id }) => _id )}
      }];
      expectedActions.forEach(
        action => expect(store.getActions()).toContainEqual(action)
      );
    });
  });

  describe('searchOnRYMAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = searchOnRYMAction({ albums: [albums[0]] });
      expect(title).toBe(`Search '${albums[0].artist} - ${albums[0].title}' on rateyourmusic`);
      expect(typeof handler).toBe('function');
    });
  });

  describe('searchOnDiscogsAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = searchOnDiscogsAction({ albums: [albums[0]] });
      expect(title).toBe(`Search '${albums[0].artist} - ${albums[0].title}' on Discogs`);
      expect(typeof handler).toBe('function');
    });
  });

  describe('searchOnYoutubeAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = searchOnYoutubeAction({ albums: [albums[0]] });
      expect(title).toBe(`Search '${albums[0].artist} - ${albums[0].title}' on Youtube`);
      expect(typeof handler).toBe('function');
    });
  });
});
