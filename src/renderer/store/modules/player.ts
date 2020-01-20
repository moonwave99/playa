import { ipcRenderer as ipc } from 'electron';
import Player from '../../player';
import { Playlist } from './playlist';
import { Album, getAlbumContentResponse } from './album';
import { Track, getTrackListResponse } from './track';
import { ApplicationState } from '../store';

import { IPC_MESSAGES } from '../../../constants';
const { IPC_ALBUM_GET_SINGLE_INFO } = IPC_MESSAGES;

type PlayerSelectorInfo = {
  currentPlaylist: Playlist;
  currentAlbum: Album;
  currentTrack: Track;
  queue: Album[];
  cover: string;
  waveform: string;
}

export function playerSelector({
  player,
  playlists,
  albums,
  tracks,
  covers,
  waveforms
}: ApplicationState): PlayerSelectorInfo {
  const {
    currentPlaylistId,
    currentAlbumId,
    currentTrackId,
    queue
  } = player;
  return {
    currentPlaylist: playlists.allById[currentPlaylistId],
    currentAlbum: albums.allById[currentAlbumId],
    currentTrack: tracks.allById[currentTrackId],
    cover: covers.allById[currentAlbumId],
    waveform: waveforms.allById[currentTrackId],
    queue
  };
}

export interface PlayerState {
  queue: Album[];
  currentPlaylistId: Playlist['_id'] | null;
  currentAlbumId: Album['_id'] | null;
  currentTrackId: Track['_id'] | null;
  isPlaying: boolean;
}

export const PLAYER_PLAY_TRACK      = 'playa/player/PLAY_TRACK';
export const PLAYER_TOGGLE_PLAYBACK = 'playa/player/PLAYER_TOGGLE_PLAYBACK';
export const PLAYER_SEEK_TO         = 'playa/player/PLAYER_SEEK_TO';
export const PLAYER_UPDATE_QUEUE    = 'playa/player/UPDATE_QUEUE';

interface PlayTrackAction {
  type: typeof PLAYER_PLAY_TRACK;
  queue: Album[];
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

interface UpdateQueueAction {
  type: typeof PLAYER_UPDATE_QUEUE;
  queue: Album[];
}

export type PlayerActionTypes =
   PlayTrackAction
  | TogglePlaybackAction
  | SeekToAction
  | UpdateQueueAction;

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
  async (dispatch: Function, getState: Function): Promise<void> => {
    const { playlists, albums, tracks }: ApplicationState = getState();
    const playlist = playlists.allById[playlistId];
    let album = albums.allById[albumId];
    const track = tracks.allById[trackId];

    if (!album || !track) {
      const {
        album: foundAlbum,
        tracks: foundTracks
      } = await ipc.invoke(IPC_ALBUM_GET_SINGLE_INFO, [albumId]);
      album = foundAlbum;
      dispatch(getAlbumContentResponse(foundAlbum));
      dispatch(getTrackListResponse(foundTracks));
    }

    const queue = playlistId
      ? playlist.albums.map(x => albums.allById[x])
      : [album];

    dispatch({
      type: PLAYER_PLAY_TRACK,
      albumId,
      playlistId,
      trackId: trackId || album.tracks[0],
      queue
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

export const updateQueue = (queue: Album[] = []): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYER_UPDATE_QUEUE,
      queue
    });
  }

const INITIAL_STATE: PlayerState = {
  queue: [] as Album[],
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
          queue: action.queue,
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
      case PLAYER_UPDATE_QUEUE:
        return {
          ...state,
          queue: action.queue
        };
      default:
        return state;
    }
  }
}
