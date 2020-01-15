import reducer, {
  PlayerActionTypes,
  PlayerState,
  playTrack,
  stop,
  pause,
  togglePlayback,
  nextTrack,
  prevTrack,
  PLAYER_PLAY_TRACK,
  PLAYER_STOP,
  PLAYER_PAUSE,
  PLAYER_TOGGLE_PLAYBACK,
  PLAYER_NEXT_TRACK,
  PLAYER_PREV_TRACK
} from './player';

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

  it('should dispatch stop request', () => {
    const dispatch = jest.fn();
    stop()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: PLAYER_STOP
    });
  });

  it('should dispatch pause request', () => {
    const dispatch = jest.fn();
    pause()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: PLAYER_PAUSE
    });
  });

  it('should dispatch togglePlayback request', () => {
    const dispatch = jest.fn();
    togglePlayback()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: PLAYER_TOGGLE_PLAYBACK
    });
  });

  it('should dispatch nextTrack request', () => {
    const dispatch = jest.fn();
    nextTrack()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: PLAYER_NEXT_TRACK
    });
  });

  it('should dispatch prevTrack request', () => {
    const dispatch = jest.fn();
    prevTrack()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: PLAYER_PREV_TRACK
    });
  });
});

describe('player reducer', () => {
  const initialState = {
    currentPlaylistId: null,
    currentAlbumId: null,
    currentTrackId: null,
    isPlaying: false,
    isPaused: false
  } as PlayerState;
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as PlayerActionTypes))
      .toEqual(initialState);
  });

  it('should handle PLAYER_PLAY', () => {
    const playbackIds = {
      playlistId: '1',
      albumId: '2',
      trackId: '3'
    };
    expect(reducer(initialState, {
      type: PLAYER_PLAY_TRACK,
      ...playbackIds
    })).toEqual({
      ...initialState,
      isPlaying: true,
      currentPlaylistId: '1',
      currentAlbumId: '2',
      currentTrackId: '3'
    });
  });

  it('should handle PLAYER_STOP', () => {
    expect(reducer({...initialState, isPlaying: true}, {
      type: PLAYER_STOP
    })).toEqual({...initialState, isPlaying: false});
  });

  it('should handle PLAYER_PAUSE', () => {
    expect(reducer({...initialState, isPlaying: true}, {
      type: PLAYER_PAUSE
    })).toEqual({...initialState, isPlaying: false, isPaused: true});

    expect(reducer({...initialState, isPlaying: false}, {
      type: PLAYER_PAUSE
    })).toEqual({...initialState, isPlaying: false, isPaused: false});
  });

  it('should handle PLAYER_TOGGLE_PLAYBACK', () => {
    expect(reducer({...initialState, isPlaying: true}, {
      type: PLAYER_TOGGLE_PLAYBACK
    })).toEqual({...initialState, isPlaying: false, isPaused: true});

    expect(reducer({...initialState, isPlaying: false}, {
      type: PLAYER_TOGGLE_PLAYBACK
    })).toEqual({...initialState, isPlaying: true, isPaused: false});
  });

  it('should handle PLAYER_NEXT_TRACK', () => {
    expect(reducer(initialState, {
      type: PLAYER_NEXT_TRACK
    })).toEqual(initialState);
  });

  it('should handle PLAYER_PREV_TRACK', () => {
    expect(reducer(initialState, {
      type: PLAYER_PREV_TRACK
    })).toEqual(initialState);
  });
});
