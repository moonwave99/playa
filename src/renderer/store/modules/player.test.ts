import initReducer, {
  PlayerActionTypes,
  PlayerState,
  playTrack,
  togglePlayback,
  seekTo,
  PLAYER_PLAY_TRACK,
  PLAYER_TOGGLE_PLAYBACK,
  PLAYER_SEEK_TO
} from './player';

import Player from '../../player';

describe('player actions', () => {
  it('should dispatch play request', () => {
    const dispatch = jest.fn();
    const playbackIds = {
      playlistId: '1',
      albumId: '2',
      trackId: '3'
    };
    playTrack(playbackIds)(dispatch);
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
    isPlaying: false
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
});
