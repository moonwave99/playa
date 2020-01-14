import { Playlist } from './playlist';
import { Album } from './album';
import { Track } from './track';

export interface PlayerState {
  currentPlaylistId: Playlist['_id'] | null;
  currentAlbumId: Album['_id'] | null;
  currentTrackId: Track['_id'] | null;
  isPlaying: boolean;
  isPaused: boolean;
}

export const PLAYER_PLAY       = 'playa/player/PLAY';
export const PLAYER_STOP       = 'playa/player/STOP';
export const PLAYER_PAUSE      = 'playa/player/PAUSE';
export const PLAYER_NEXT_TRACK = 'playa/player/NEXT_TRACK';
export const PLAYER_PREV_TRACK = 'playa/player/PREV_TRACK';

interface PlayAction {
  type: typeof PLAYER_PLAY;
  playlistId?: Playlist['_id'];
  albumId: Album['_id'];
  trackId?: Track['_id'];
}

interface StopAction {
  type: typeof PLAYER_STOP;
}

interface PauseAction {
  type: typeof PLAYER_PAUSE;
}

interface NextTrackAction {
  type: typeof PLAYER_NEXT_TRACK;
}

interface PrevTrackAction {
  type: typeof PLAYER_PREV_TRACK;
}

export type PlayerActionTypes =
    PlayAction
  | StopAction
  | PauseAction
  | NextTrackAction
  | PrevTrackAction;

type PlayActionParams = {
  playlistId?: Playlist['_id'];
  albumId: Album['_id'];
  trackId?: Track['_id'];
}

export const play = ({
  playlistId,
  albumId,
  trackId
}: PlayActionParams): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYER_PLAY,
      playlistId,
      albumId,
      trackId
    });
  }

export const stop = (): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYER_STOP
    });
  }

export const pause = (): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYER_PAUSE
    });
  }

export const nextTrack = (): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYER_NEXT_TRACK
    });
  }

export const prevTrack = (): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYER_PREV_TRACK
    });
  }


const INITIAL_STATE: PlayerState = {
  currentPlaylistId: null,
  currentAlbumId: null,
  currentTrackId: null,
  isPlaying: false,
  isPaused: false
};

export default function reducer(
  state: PlayerState = INITIAL_STATE,
  action: PlayerActionTypes
): PlayerState {
  switch (action.type) {
    case PLAYER_PLAY:
      return {
        ...state,
        isPlaying: true,
        isPaused: false,
        currentPlaylistId: action.playlistId,
        currentAlbumId: action.albumId,
        currentTrackId: action.trackId
      };
    case PLAYER_STOP:
      return {
        ...state,
        isPlaying: false,
        isPaused: false
      };
    case PLAYER_PAUSE:
      return {
        ...state,
        isPlaying: false,
        isPaused: !(state.isPlaying === false)
      };
    case PLAYER_NEXT_TRACK:
      return state;
    case PLAYER_PREV_TRACK:
      return state;
    default:
      return state;
  }
}
