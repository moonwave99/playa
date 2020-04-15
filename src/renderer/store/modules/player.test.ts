import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { EntityHashMap, toObj } from '../../utils/storeUtils';
import { playlists, albums, tracks } from '../../../../test/testFixtures';
import initReducer, {
  PlayerActionTypes,
  PlayerState,
  playTrack,
  togglePlayback,
  playPreviousTrack,
  playNextTrack,
  setVolume,
  seekTo,
  unloadTrack,
  updateQueue,
  enqueueAfterCurrent,
  enqueueAtEnd,
  selectors,
  playerSelector,
  PLAYER_PLAY_TRACK,
  PLAYER_TOGGLE_PLAYBACK,
  PLAYER_SEEK_TO,
  PLAYER_CHANGE_VOLUME,
  PLAYER_UPDATE_QUEUE,
  PLAYER_UNLOAD_TRACK
} from './player';

import {
  ALBUM_GET_LIST_RESPONSE,
  ALBUM_GET_CONTENT_RESPONSE
} from './album';

import {
  TRACK_GET_LIST_RESPONSE
} from './track';

import { UPDATE_STATE } from './ui';
import { ApplicationState } from '../store';

import Player from '../../lib/player';

describe('player actions', () => {
  describe('playTrack', () => {
    it('should dispatch play request', async () => {
      const store = mockStore({
        albums: {
          allById: toObj(albums)
        },
        tracks: {
          allById: toObj(tracks)
        }
      });
      const playbackIds = {
        playlistId: '1',
        albumId: '1',
        trackId: tracks[1]._id
      };
      await playTrack(playbackIds)(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([
        {
          type: PLAYER_PLAY_TRACK,
          ...playbackIds
        }
      ]);
    });

    it('should request album info if not present in store', async () => {
      const store = mockStore({
        albums: {
          allById: {}
        },
        tracks: {
          allById: {}
        }
      });
      const playbackIds = {
        playlistId: '1',
        albumId: '1',
        trackId: tracks[0]._id
      };
      await playTrack(playbackIds)(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([
        {
          type: ALBUM_GET_CONTENT_RESPONSE,
          album: {
            ...albums[0],
            tracks: [tracks[0]._id, tracks[1]._id]
          }
        },
        {
          type: TRACK_GET_LIST_RESPONSE,
          results: [tracks[0], tracks[1]]
        },
        {
          type: PLAYER_PLAY_TRACK,
          ...playbackIds
        }
      ]);
    });
  });

  it('should dispatch togglePlayback request', () => {
    const dispatch = jest.fn();
    togglePlayback()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: PLAYER_TOGGLE_PLAYBACK
    });
  });

  it('should dispatch seekTo request', () => {
    const dispatch = jest.fn();
    seekTo(0)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: PLAYER_SEEK_TO,
      position: 0
    });
  });

  it('should dispatch setVolume request', () => {
    const store = mockStore({});
    setVolume(0.5)(store.dispatch);

    const expectedActions = [{
      type: PLAYER_CHANGE_VOLUME,
      volume: 0.5
    },
    {
      type: UPDATE_STATE,
      params: {
        volume: 0.5
      }
    }];

    expectedActions.forEach(
      action => expect(store.getActions()).toContainEqual(action)
    );
  });

  it('should dispatch unloadTrack request', () => {
    const dispatch = jest.fn();
    unloadTrack()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: PLAYER_UNLOAD_TRACK
    });
  });

  describe('playPreviousTrack', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        playlists: {
          allById: toObj(playlists)
        },
        albums: {
          allById: toObj([
            {
              ...albums[0],
              tracks: [tracks[0]._id, tracks[1]._id]
            },
            {
              ...albums[1],
              tracks: [tracks[2]._id, tracks[3]._id]
            }
          ])
        },
        tracks: {
          allById: toObj(tracks)
        },
        player: {
          queue: ['1', '2'],
          currentAlbumId: '2',
          currentTrackId: tracks[2]._id,
          currentPlaylistId: '1'
        },
        waveforms: {
          allById: {}
        }
      });
      const playbackIds = {
        playlistId: '1',
        albumId: '1',
        trackId: tracks[1]._id
      };
      await playPreviousTrack()(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([
        {
          type: PLAYER_PLAY_TRACK,
          ...playbackIds
        }
      ]);
    });

    it('should dispatch nothing if there is no current track', async () => {
      const store = mockStore({
        playlists: {
          allById: {}
        },
        albums: {
          allById: {}
        },
        tracks: {
          allById: {}
        },
        player: {
          queue: [],
          currentTrackId: null
        },
        waveforms: {
          allById: {}
        }
      });
      await playPreviousTrack()(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([]);
    });
  });

  describe('playNextTrack', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        playlists: {
          allById: toObj(playlists)
        },
        albums: {
          allById: toObj([
            {
              ...albums[0],
              tracks: [tracks[0]._id, tracks[1]._id]
            },
            {
              ...albums[1],
              tracks: [tracks[2]._id, tracks[3]._id]
            }
          ])
        },
        tracks: {
          allById: toObj(tracks)
        },
        player: {
          queue: ['1', '2'],
          currentAlbumId: '1',
          currentTrackId: tracks[1]._id,
          currentPlaylistId: '1'
        },
        waveforms: {
          allById: {}
        }
      });
      const playbackIds = {
        playlistId: '1',
        albumId: '2',
        trackId: tracks[2]._id
      };
      await playNextTrack()(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([
        {
          type: PLAYER_PLAY_TRACK,
          ...playbackIds
        }
      ]);
    });

    it('should dispatch nothing if there is no current track', async () => {
      const store = mockStore({
        playlists: {
          allById: {}
        },
        albums: {
          allById: {}
        },
        tracks: {
          allById: {}
        },
        player: {
          queue: [],
          currentTrackId: null
        },
        waveforms: {
          allById: {}
        }
      });
      await playNextTrack()(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([]);
    });
  });

  describe('enqueueAfterCurrent', () => {
    it('should enqueue given albums after current album', async () => {
      const store = mockStore({
        player: {
          queue: ['2'],
          currentAlbumId: '2'
        },
        albums: {
          allById: toObj(albums)
        }
      });

      await enqueueAfterCurrent(['1'])(store.dispatch, store.getState);

      expect(store.getActions()).toEqual([
        {
          type: UPDATE_STATE,
          params: {
            queue: ['2', '1']
          }
        },
        {
          type: PLAYER_UPDATE_QUEUE,
          queue: ['2', '1']
        }
      ]);
    });
  });

  describe('updateQueue', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        player: {
          queue: [],
          currentAlbumId: null
        },
        albums: {
          allById: {}
        }
      });

      await updateQueue(['1', '2'])(store.dispatch, store.getState);

      expect(store.getActions()).toEqual([
        {
          type: ALBUM_GET_LIST_RESPONSE,
          results: [albums[0], albums[1]]
        },
        {
          type: UPDATE_STATE,
          params: {
            queue: ['1', '2']
          }
        },
        {
          type: PLAYER_UPDATE_QUEUE,
          queue: ['1', '2']
        }
      ]);
    });

    it('should not request albums if none are missing', async () => {
      const store = mockStore({
        player: {
          queue: [],
          currentAlbumId: null
        },
        albums: {
          allById: toObj(albums)
        }
      });

      await updateQueue(['1', '2'])(store.dispatch, store.getState);

      expect(store.getActions()).toEqual([
        {
          type: UPDATE_STATE,
          params: {
            queue: ['1', '2']
          }
        },
        {
          type: PLAYER_UPDATE_QUEUE,
          queue: ['1', '2']
        }
      ]);
    });
  });

  describe('enqueueAtEnd', () => {
    it('should enqueue given albums at the end of playback queue', async () => {
      const store = mockStore({
        player: {
          queue: ['1']
        },
        albums: {
          allById: toObj(albums)
        }
      });

      await enqueueAtEnd(['2'])(store.dispatch, store.getState);

      expect(store.getActions()).toEqual([
        {
          type: UPDATE_STATE,
          params: {
            queue: ['1', '2']
          }
        },
        {
          type: PLAYER_UPDATE_QUEUE,
          queue: ['1', '2']
        }
      ]);
    });
  });
});

describe('player reducer', () => {
  const reducer = initReducer({
    seekTo: (position: number): void => { position },
    setVolume: (volume: number): void => { volume },
    togglePlayback: (): void => { return; },
    loadTrack: (_path: string): void => { _path; },
    play: (): void => { return; },
    isPlaying: (): boolean => { return true; }
  } as Player);

  const initialState = {
    currentPlaylistId: null,
    currentAlbumId: null,
    currentTrackId: null,
    isPlaying: false,
    queue: []
  } as PlayerState;
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as PlayerActionTypes))
      .toEqual(initialState);
  });

  it('should handle PLAYER_PLAY_TRACK', () => {
    expect(reducer(initialState, {
      type: PLAYER_PLAY_TRACK,
      playlistId: '1',
      albumId: '1',
      trackId: '1'
    })).toEqual({
      ...initialState,
      currentPlaylistId: '1',
      currentAlbumId: '1',
      currentTrackId: '1',
      isPlaying: true
    });
  });

  it('should handle PLAYER_TOGGLE_PLAYBACK', () => {
    expect(reducer(initialState, {
      type: PLAYER_TOGGLE_PLAYBACK
    })).toEqual({
      ...initialState,
      isPlaying: true
    });
  });

  it('should handle PLAYER_SEEK_TO', () => {
    expect(reducer(initialState, {
      type: PLAYER_SEEK_TO,
      position: 0
    })).toEqual(initialState);
  });

  it('should handle PLAYER_UPDATE_QUEUE', () => {
    expect(reducer(initialState, {
      type: PLAYER_UPDATE_QUEUE,
      queue: ['1', '2']
    })).toEqual({
      ...initialState,
      queue: ['1', '2']
    });
  });

  it('should handle PLAYER_CHANGE_VOLUME', () => {
    expect(reducer(initialState, {
      type: PLAYER_CHANGE_VOLUME,
      volume: 0.5
    })).toEqual(initialState);
  });

  it('should handle PLAYER_UNLOAD_TRACK', () => {
    expect(reducer({...initialState, ...{ currentTrackId: '1' }}, {
      type: PLAYER_UNLOAD_TRACK
    })).toEqual(initialState);
  });
});

describe('player selectors', () => {
  const albumsWithTracks = [
    {
      ...albums[0],
      tracks: [tracks[0]._id, tracks[1]._id]
    },
    {
      ...albums[1],
      tracks: [tracks[2]._id, tracks[3]._id]
    }
  ];
  const state = {
    playlists: {
      allById: toObj(playlists)
    },
    albums: {
      allById: toObj(albumsWithTracks)
    },
    tracks: {
      allById: toObj(tracks)
    },
    player: {
      queue: ['1', '2'],
      currentAlbumId: '1',
      currentTrackId: tracks[0]._id,
      currentPlaylistId: '1'
    },
    waveforms: {
      allById: {
        '/path/to/track_1.mp3': '/path/to/waveform'
      } as EntityHashMap<string>
    }
  } as ApplicationState;

  describe('state', () => {
    it('should return the player state', () => {
      const selection = selectors.state(state);
      expect(selection).toEqual(state.player);
    });
  });

  describe('playerSelector', () => {
    it('should return player selection', () => {
      const selection = playerSelector(state);
      expect(selection.currentPlaylist).toEqual(playlists[0]);
      expect(selection.currentAlbum).toEqual(        {
        ...albums[0],
        tracks: [tracks[0]._id, tracks[1]._id]
      });
      expect(selection.currentAlbumId).toEqual(albums[0]._id);
      expect(selection.currentTrack).toEqual(tracks[0]);
      expect(selection.waveform).toBe('/path/to/waveform');
      expect(selection.queue).toEqual(albumsWithTracks);
    });
  });
});
