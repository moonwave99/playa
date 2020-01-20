import initReducer, {
  PlayerActionTypes,
  PlayerState,
  playTrack,
  togglePlayback,
  seekTo,
  unloadTrack,
  PLAYER_PLAY_TRACK,
  PLAYER_TOGGLE_PLAYBACK,
  PLAYER_SEEK_TO,
  PLAYER_UNLOAD_TRACK
} from './player';

import Player from '../../player';

describe('player actions', () => {
  it.skip('should dispatch play request', async () => {
    const dispatch = jest.fn();
    const playbackIds = {
      playlistId: '1',
      albumId: '2',
      trackId: '3'
    };
    await playTrack(playbackIds)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: PLAYER_PLAY_TRACK,
      ...playbackIds
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

  it('should dispatch unloadTrack request', () => {
    const dispatch = jest.fn();
    unloadTrack()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: PLAYER_UNLOAD_TRACK
    });
  });
});

describe('player reducer', () => {
  function noOp(position: number): void { position }

  const reducer = initReducer({
    seekTo: noOp
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

  it('should handle PLAYER_UNLOAD_TRACK', () => {
    expect(reducer({...initialState, ...{ currentTrackId: '1' }}, {
      type: PLAYER_UNLOAD_TRACK
    })).toEqual(initialState);
  });
});
