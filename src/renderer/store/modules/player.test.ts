import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { toObj } from '../../utils/storeUtils';
import { playlists, albums, tracks } from '../../../../test/testFixtures';
import initReducer, {
  PlayerActionTypes,
  PlayerState,
  playTrack,
  togglePlayback,
  playPreviousTrack,
  playNextTrack,
  seekTo,
  changeVolume,
  unloadTrack,
  PLAYER_PLAY_TRACK,
  PLAYER_TOGGLE_PLAYBACK,
  PLAYER_SEEK_TO,
  PLAYER_CHANGE_VOLUME,
  PLAYER_UNLOAD_TRACK
} from './player';

import Player from '../../lib/player';

describe('player actions', () => {
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
      trackId: '2'
    };
    await playTrack(playbackIds)(store.dispatch, store.getState);
    expect(store.getActions()).toEqual([
      {
        type: PLAYER_PLAY_TRACK,
        ...playbackIds
      }
    ]);
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

  it('should dispatch changeVolume request', () => {
    const dispatch = jest.fn();
    changeVolume(0.5)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: PLAYER_CHANGE_VOLUME,
      volume: 0.5
    });
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
              tracks: ['1', '2']
            },
            {
              ...albums[1],
              tracks: ['3', '4']
            }
          ])
        },
        tracks: {
          allById: toObj(tracks)
        },
        player: {
          queue: ['1', '2'],
          currentAlbumId: '2',
          currentTrackId: '3',
          currentPlaylistId: '1'
        },
        covers: {
          allById: {}
        },
        waveforms: {
          allById: {}
        }
      });
      const playbackIds = {
        playlistId: '1',
        albumId: '1',
        trackId: '2'
      };
      await playPreviousTrack()(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([
        {
          type: PLAYER_PLAY_TRACK,
          ...playbackIds
        }
      ]);
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
              tracks: ['1', '2']
            },
            {
              ...albums[1],
              tracks: ['3', '4']
            }
          ])
        },
        tracks: {
          allById: toObj(tracks)
        },
        player: {
          queue: ['1', '2'],
          currentAlbumId: '1',
          currentTrackId: '2',
          currentPlaylistId: '1'
        },
        covers: {
          allById: {}
        },
        waveforms: {
          allById: {}
        }
      });
      const playbackIds = {
        playlistId: '1',
        albumId: '2',
        trackId: '3'
      };
      await playNextTrack()(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([
        {
          type: PLAYER_PLAY_TRACK,
          ...playbackIds
        }
      ]);
    });
  });
});

describe('player reducer', () => {
  const reducer = initReducer({
    seekTo: (position: number): void => { position },
    changeVolume: (volume: number): void => { volume }
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

  it('should handle PLAYER_SEEK_TO', () => {
    expect(reducer(initialState, {
      type: PLAYER_SEEK_TO,
      position: 0
    })).toEqual(initialState);
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
