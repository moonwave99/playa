import { uniq } from 'lodash';
import { ipcRenderer as ipc } from 'electron';
import { createSelector } from 'reselect';
import Player from '../../lib/player';
import { Playlist, selectors as playlistSelectors } from './playlist';
import {
  Album,
  getAlbumListResponse,
  getAlbumContentResponse,
  selectors as albumSelectors
} from './album';
import { Track, getTrackListResponse, selectors as trackSelectors } from './track';
import { selectors as waveformSelectors } from './waveform';
import { updateState } from './ui';
import { immutableInsertArrayAtIndex } from '../../utils/storeUtils';
import { getPrevTrack, getNextTrack } from '../../utils/tracklistUtils';
import { ApplicationState } from '../store';

import { IPC_MESSAGES } from '../../../constants';
const {
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_GET_SINGLE_INFO
} = IPC_MESSAGES;

export interface PlayerState {
  queue: Album['_id'][];
  currentPlaylistId: Playlist['_id'] | null;
  currentAlbumId: Album['_id'] | null;
  currentTrackId: Track['_id'] | null;
  isPlaying: boolean;
}

export const selectors = {
  state: ({ player }: ApplicationState): PlayerState => player
};

type GetPlayerInfoSelection = {
  currentPlaylist: Playlist;
  currentAlbum: Album;
  currentAlbumId: Album['_id'];
  currentTrack: Track;
  queue: Album[];
  waveform: string;
}

export const playerSelector = createSelector(
  selectors.state,
  playlistSelectors.allById,
  albumSelectors.allById,
  trackSelectors.allById,
  waveformSelectors.allById,
  (player, playlists, albums, tracks, waveforms): GetPlayerInfoSelection => {
    const {
      currentPlaylistId,
      currentAlbumId,
      currentTrackId,
      queue
    } = player;
    return {
      currentPlaylist: playlists[currentPlaylistId],
      currentAlbum: albums[currentAlbumId],
      currentAlbumId,
      currentTrack: tracks[currentTrackId],
      waveform: waveforms[currentTrackId],
      queue: queue.map(x => albums[x])
    };
  }
);

export const PLAYER_PLAY_TRACK            = 'playa/player/PLAY_TRACK';
export const PLAYER_TOGGLE_PLAYBACK       = 'playa/player/PLAYER_TOGGLE_PLAYBACK';
export const PLAYER_PLAY_PREV             = 'playa/player/PLAY_PREV';
export const PLAYER_PLAY_NEXT             = 'playa/player/PLAY_NEXT';
export const PLAYER_SEEK_TO               = 'playa/player/PLAYER_SEEK_TO';
export const PLAYER_CHANGE_VOLUME         = 'playa/player/PLAYER_CHANGE_VOLUME';
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

interface PlayPrevAction {
  type: typeof PLAYER_PLAY_PREV;
}

interface PlayNextAction {
  type: typeof PLAYER_PLAY_NEXT;
}

interface SeekToAction {
  type: typeof PLAYER_SEEK_TO;
  position: number;
}

interface SetVolumeAction {
  type: typeof PLAYER_CHANGE_VOLUME;
  volume: number;
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
  | PlayPrevAction
  | PlayNextAction
  | SeekToAction
  | SetVolumeAction
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

export const playPreviousTrack = (): Function =>
  (dispatch: Function, getState: Function): void => {
    const {
      queue,
      currentPlaylist,
      currentTrack
    } = playerSelector(getState());
    if (!currentTrack) {
      return;
    }
    const { albumId, trackId } = getPrevTrack(currentTrack._id, queue);
		if (albumId && trackId ) {
			dispatch(playTrack({
				playlistId: currentPlaylist ? currentPlaylist._id : null,
				albumId,
				trackId
			}));
		}
  }

export const playNextTrack = (): Function =>
  (dispatch: Function, getState: Function): void => {
    const {
      queue,
      currentPlaylist,
      currentTrack
    } = playerSelector(getState());
    if (!currentTrack) {
      return;
    }
    const { albumId, trackId } = getNextTrack(currentTrack._id, queue);
		if (albumId && trackId ) {
			dispatch(playTrack({
				playlistId: currentPlaylist ? currentPlaylist._id : null,
				albumId,
				trackId
			}));
		}
  }

export const setVolume = (volume: number): Function =>
  (dispatch: Function): void => {
    dispatch(updateState({ volume }));
    dispatch({
      type: PLAYER_CHANGE_VOLUME,
      volume
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
    const uniqQueue = uniq(queue);
    const missingAlbumIDs = uniqQueue.filter(x => !albums.allById[x]);
    if (missingAlbumIDs.length) {
      const results = await ipc.invoke(IPC_ALBUM_GET_LIST_REQUEST, missingAlbumIDs);
      dispatch(getAlbumListResponse(results));
    }
    dispatch(updateState({ queue: uniqQueue }));
    dispatch({
      type: PLAYER_UPDATE_QUEUE,
      queue: uniqQueue
    });
  }

export const enqueueAfterCurrent = (albumIDs: Album['_id'][]): Function =>
  (dispatch: Function, getState: Function): void => {
    const { player }: ApplicationState = getState();
    const currentAlbumIndex = player.queue.indexOf(player.currentAlbumId);
    dispatch(
      updateQueue(
        immutableInsertArrayAtIndex(player.queue, albumIDs, currentAlbumIndex +1)
      )
    );
  }

export const enqueueAtEnd = (albumIDs: Album['_id'][]): Function =>
  (dispatch: Function, getState: Function): void => {
    const { player }: ApplicationState = getState();
    dispatch(updateQueue([...player.queue, ...albumIDs]));
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
      case PLAYER_CHANGE_VOLUME:
        player.setVolume(action.volume);
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
