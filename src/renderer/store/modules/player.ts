import { ipcRenderer as ipc } from 'electron';
import Player from '../../player';
import { Playlist } from './playlist';
import {
  Album,
  getAlbumListResponse,
  getAlbumContentResponse
} from './album';
import { Track, getTrackListResponse } from './track';
import { updateState } from './ui';
import { immutableInsertAtIndex } from '../../utils/storeUtils';
import { ApplicationState } from '../store';

import { IPC_MESSAGES } from '../../../constants';
const {
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_GET_SINGLE_INFO
} = IPC_MESSAGES;

type PlayerSelectorInfo = {
  currentPlaylist: Playlist;
  currentAlbum: Album;
  currentAlbumId: Album['_id'];
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
    currentAlbumId,
    currentTrack: tracks.allById[currentTrackId],
    cover: covers.allById[currentAlbumId],
    waveform: waveforms.allById[currentTrackId],
    queue: queue.map(x => albums.allById[x])
  };
}

export interface PlayerState {
  queue: Album['_id'][];
  currentPlaylistId: Playlist['_id'] | null;
  currentAlbumId: Album['_id'] | null;
  currentTrackId: Track['_id'] | null;
  isPlaying: boolean;
}

export const PLAYER_PLAY_TRACK            = 'playa/player/PLAY_TRACK';
export const PLAYER_TOGGLE_PLAYBACK       = 'playa/player/PLAYER_TOGGLE_PLAYBACK';
export const PLAYER_SEEK_TO               = 'playa/player/PLAYER_SEEK_TO';
export const PLAYER_UPDATE_QUEUE          = 'playa/player/UPDATE_QUEUE';
export const PLAYER_ENQUEUE_AFTER_CURRENT = 'playa/player/ENQUEUE_AFTER_CURRENT';
export const PLAYER_ENQUEUE_AT_END        = 'playa/player/ENQUEUE_AT_THE_END';
export const PLAYER_UNLOAD_TRACK          = 'playa/player/UNLOAD_TRACK';

interface PlayTrackAction {
  type: typeof PLAYER_PLAY_TRACK;
  playlistId: Playlist['_id'];
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
  queue: Album['_id'][];
}
interface UnloadTrackAction {
  type: typeof PLAYER_UNLOAD_TRACK;
}

interface EnqueueAfterCurrentAction {
  type: typeof PLAYER_ENQUEUE_AFTER_CURRENT;
  albumId: Album['_id'];
}

interface EnqueueAtEndAction {
  type: typeof PLAYER_ENQUEUE_AT_END;
  albumId: Album['_id'];
}

export type PlayerActionTypes =
   PlayTrackAction
  | TogglePlaybackAction
  | SeekToAction
  | UpdateQueueAction
  | EnqueueAfterCurrentAction
  | EnqueueAtEndAction
  | UnloadTrackAction;

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
    const { albums, tracks }: ApplicationState = getState();
    let album = albums.allById[albumId];
    const track = tracks.allById[trackId];

    if (!album || !track) {
      const {
        album: foundAlbum,
        tracks: foundTracks
      } = await ipc.invoke(IPC_ALBUM_GET_SINGLE_INFO, albumId);
      album = foundAlbum;
      dispatch(getAlbumContentResponse(foundAlbum));
      dispatch(getTrackListResponse(foundTracks));
    }

    dispatch({
      type: PLAYER_PLAY_TRACK,
      albumId,
      playlistId,
      trackId: trackId || album.tracks[0]
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

export const updateQueue = (queue: Album['_id'][] = []): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    const { albums } = getState();
    const missingAlbumIDs = queue.filter(x => !albums.allById[x]);
    const results = await ipc.invoke(IPC_ALBUM_GET_LIST_REQUEST, missingAlbumIDs);
    dispatch(getAlbumListResponse(results));
    dispatch(updateState({ queue }));
    dispatch({
      type: PLAYER_UPDATE_QUEUE,
      queue
    });
  }

export const enqueueAfterCurrent = (albumId: Album['_id']): Function =>
  (dispatch: Function, getState: Function): void => {
    const { player }: ApplicationState = getState();
    const currentAlbumIndex = player.queue.indexOf(player.currentAlbumId);
    dispatch(
      updateQueue(
        immutableInsertAtIndex(player.queue, albumId, currentAlbumIndex +1)
      )
    );
  }

export const enqueueAtEnd = (albumId: Album['_id']): Function =>
  (dispatch: Function, getState: Function): void => {
    const { player }: ApplicationState = getState();
    dispatch(updateQueue([...player.queue, albumId]));
  }

export const unloadTrack = (): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYER_UNLOAD_TRACK
    });
  }

const INITIAL_STATE: PlayerState = {
  queue: [] as Album['_id'][],
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
          ...state,
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
      case PLAYER_UNLOAD_TRACK:
        return {
          ...state,
          currentTrackId: null
        }
      default:
        return state;
    }
  }
}
