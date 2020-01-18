import Player from '../../player';
import { Playlist } from './playlist';
import { Album } from './album';
import { Track } from './track';
import { ApplicationState } from '../store';

type PlayerSelectorInfo = {
  currentPlaylist: Playlist;
  currentPlaylistAlbums: Album[];
  currentAlbum: Album;
  currentTrack: Track;
  cover: string;
}

export function playerSelector({ player, playlists, albums, tracks, covers }: ApplicationState): PlayerSelectorInfo {
  const {
    currentPlaylistId,
    currentAlbumId,
    currentTrackId
  } = player;
  const currentPlaylist = playlists.allById[currentPlaylistId];
  const currentPlaylistAlbums = currentPlaylist
    ? currentPlaylist.albums.map(x => albums.allById[x])
    : [];
  return {
    currentPlaylist,
    currentPlaylistAlbums,
    currentAlbum: albums.allById[currentAlbumId],
    currentTrack: tracks.allById[currentTrackId],
    cover: covers.allById[currentAlbumId]
  };
}

export interface PlayerState {
  currentPlaylistId: Playlist['_id'] | null;
  currentAlbumId: Album['_id'] | null;
  currentTrackId: Track['_id'] | null;
  isPlaying: boolean;
}

export const PLAYER_PLAY_TRACK      = 'playa/player/PLAY_TRACK';
export const PLAYER_TOGGLE_PLAYBACK = 'playa/player/PLAYER_TOGGLE_PLAYBACK';
export const PLAYER_SEEK_TO         = 'playa/player/PLAYER_SEEK_TO';

interface PlayTrackAction {
  type: typeof PLAYER_PLAY_TRACK;
  playlistId?: Playlist['_id'];
  albumId: Album['_id'];
  trackId?: Track['_id'];
}

interface TogglePlaybackAction {
  type: typeof PLAYER_TOGGLE_PLAYBACK;
}

interface SeekToAction {
  type: typeof PLAYER_SEEK_TO;
  position: number;
}

export type PlayerActionTypes =
    PlayTrackAction
  | TogglePlaybackAction
  | SeekToAction;

type PlayActionParams = {
  playlistId?: Playlist['_id'];
  albumId: Album['_id'];
  trackId?: Track['_id'];
}

export const playTrack = ({
  playlistId,
  albumId,
  trackId
}: PlayActionParams): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYER_PLAY_TRACK,
      playlistId,
      albumId,
      trackId
    });
  }

export const togglePlayback = (): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYER_TOGGLE_PLAYBACK
    });
  }

export const seekTo = (position: number): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYER_SEEK_TO,
      position
    });
  }

const INITIAL_STATE: PlayerState = {
  currentPlaylistId: null,
  currentAlbumId: null,
  currentTrackId: null,
  isPlaying: false
};

export default function initReducer(player: Player) {
  return (
    state: PlayerState = INITIAL_STATE,
    action: PlayerActionTypes
  ): PlayerState => {
    switch (action.type) {
      case PLAYER_PLAY_TRACK:
        player.loadTrack(action.trackId);
        player.play();
        return {
          currentPlaylistId: action.playlistId,
          currentAlbumId: action.albumId,
          currentTrackId: action.trackId,
          isPlaying: player.isPlaying()
        };
      case PLAYER_TOGGLE_PLAYBACK:
        player.togglePlayback();
        return {
          ...state,
          isPlaying: player.isPlaying()
        };
      case PLAYER_SEEK_TO:
        player.seekTo(action.position);
        return state;
      default:
        return state;
    }
  }
}
