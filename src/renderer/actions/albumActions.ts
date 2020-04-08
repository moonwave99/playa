import { ipcRenderer as ipc, MenuItemConstructorOptions } from 'electron';
import { Action, ActionCreator, ActionGroupsMap, ActionMap, grouper } from './actionUtils';

import { Playlist } from '../store/modules/playlist';

import {
  Album,
  reloadAlbumContent,
  editAlbum
} from '../store/modules/album';

import { Artist } from '../store/modules/artist';
import { Track } from '../store/modules/track';

import {
  playTrack,
  updateQueue,
  enqueueAfterCurrent,
  enqueueAtEnd
} from '../store/modules/player';

import { IPC_MESSAGES, SEARCH_URLS } from '../../constants';
const {
  IPC_SYS_REVEAL_IN_FINDER,
  IPC_SYS_OPEN_URL
} = IPC_MESSAGES;

export type ActionParams = {
  selection: Album[];
  artist?: Artist;
  queue?: Album['_id'][];
  playlistId?: Playlist['_id'];
  trackId?: Track['_id'];
  dispatch?: Function;
}

function createSearchAction(
  searchURL: SEARCH_URLS,
  siteName: string
): ActionCreator<ActionParams> {
  return ({ selection, artist }): Action => {
    const query = `${artist.name} ${selection[0].title}`;
    return {
      title: `Search album on ${siteName}`,
      handler(): void { ipc.send(IPC_SYS_OPEN_URL, searchURL, query) },
      enabled: selection.length === 1
    };
  }
}

function createSearchArtistAction(
  searchURL: SEARCH_URLS,
  siteName: string
): ActionCreator<ActionParams> {
  return ({ selection, artist }): Action => {
    const query = artist.name;
    return {
      title: `Search artist on ${siteName}`,
      handler(): void { ipc.send(IPC_SYS_OPEN_URL, searchURL, query) },
      enabled: selection.length === 1
    };
  }
}

export const playAlbumAction: ActionCreator<ActionParams> = ({
  selection,
  queue,
  playlistId,
  trackId,
  dispatch
}) => {
  const albumId = selection[0]._id;
  return {
    title: 'Play album',
    handler(): void {
      dispatch(updateQueue(queue));
      dispatch(playTrack({ playlistId, albumId, trackId }))
    }
  };
}

export const editAlbumAction: ActionCreator<ActionParams> = ({
  selection,
  dispatch
}) => {
  const albumId = selection[0]._id;
  return {
    title: 'Edit album',
    handler(): void {
      dispatch(editAlbum(albumId));
    },
    enabled: selection.length === 1
  };
}

export const enqueueAfterCurrentAction: ActionCreator<ActionParams> = ({
  selection,
  dispatch
}) => {
  return {
    title: 'Enqueue after current album',
    handler(): void { dispatch(enqueueAfterCurrent(selection.map(({ _id }) => _id))) }
  };
}

export const enqueueAtEndAction: ActionCreator<ActionParams> = ({
  selection,
  dispatch
}) => {
  return {
    title: 'Enqueue at the end',
    handler(): void { dispatch(enqueueAtEnd(selection.map(({ _id }) => _id))) }
  };
}

export const removeFromQueueAction: ActionCreator<ActionParams> = ({
  selection,
  queue,
  dispatch
}) => {
  return {
    title: 'Remove from queue',
    handler(): void {
      const updatedQueue = queue.filter(_id => (selection.map(({ _id }) => _id)).indexOf(_id) === -1);
      dispatch(updateQueue(updatedQueue));
    }
  };
}

export const revealInFinderAction: ActionCreator<ActionParams> = ({ selection }) => {
  const { path } = selection[0];
  return {
    title: 'Reveal album in Finder',
    handler(): void { ipc.send(IPC_SYS_REVEAL_IN_FINDER, path) },
    enabled: selection.length === 1
  };
}

export const reloadAlbumContentAction: ActionCreator<ActionParams> = ({ selection, dispatch }) => {
  return {
    title: 'Reload album tracks',
    handler(): Function { return dispatch(reloadAlbumContent((selection[0]._id))) },
    enabled: selection.length === 1
  };
}

export const searchOnRYMAction = createSearchAction(SEARCH_URLS.RYM, 'rateyourmusic');
export const searchOnDiscogsAction = createSearchAction(SEARCH_URLS.DISCOGS, 'Discogs');
export const searchOnYoutubeAction = createSearchAction(SEARCH_URLS.YOUTUBE, 'Youtube');

export const searchArtistOnRYMAction = createSearchArtistAction(SEARCH_URLS.RYM_ARTIST, 'rateyourmusic');

export const ALBUM_CONTEXT_ACTIONS = 'playa/context-menu/album-actions';

export enum AlbumActions {
  PLAY_ALBUM = 'PLAY_ALBUM',
  EDIT_ALBUM = 'EDIT_ALBUM',
  ENQUEUE_AFTER_CURRENT = 'ENQUEUE_AFTER_CURRENT',
  ENQUEUE_AT_END = 'ENQUEUE_AT_END',
  REMOVE_FROM_QUEUE = 'REMOVE_FROM_QUEUE',
  REVEAL_IN_FINDER = 'REVEAL_IN_FINDER',
  RELOAD_ALBUM_CONTENT = 'RELOAD_ALBUM_CONTENT',
  SEARCH_ON_RYM = 'SEARCH_ON_RYM',
  SEARCH_ON_DISCOGS = 'SEARCH_ON_DISCOGS',
  SEARCH_ON_YOUTUBE = 'SEARCH_ON_YOUTUBE'
}

export const AlbumActionsMap: ActionMap<ActionParams> = {
  [AlbumActions.PLAY_ALBUM]: playAlbumAction,
  [AlbumActions.EDIT_ALBUM]: editAlbumAction,
  [AlbumActions.ENQUEUE_AFTER_CURRENT]: enqueueAfterCurrentAction,
  [AlbumActions.ENQUEUE_AT_END]: enqueueAtEndAction,
  [AlbumActions.REMOVE_FROM_QUEUE]: removeFromQueueAction,
  [AlbumActions.REVEAL_IN_FINDER]: revealInFinderAction,
  [AlbumActions.RELOAD_ALBUM_CONTENT]: reloadAlbumContentAction,
  [AlbumActions.SEARCH_ON_RYM]: searchOnRYMAction,
  [AlbumActions.SEARCH_ON_DISCOGS]: searchOnDiscogsAction,
  [AlbumActions.SEARCH_ON_YOUTUBE]: searchOnYoutubeAction
}

export enum AlbumActionsGroups {
  PLAYBACK = 'PLAYBACK',
  EDIT = 'EDIT',
  ENQUEUE = 'ENQUEUE',
  QUEUE = 'QUEUE',
  SYSTEM = 'SYSTEM',
  SEARCH_ONLINE = 'SEARCH_ONLINE',
  ARTIST = 'ARTIST'
}

const actionGroupsMap: ActionGroupsMap = {
  [AlbumActionsGroups.PLAYBACK]: [
    AlbumActions.PLAY_ALBUM
  ],
  [AlbumActionsGroups.EDIT]: [
    AlbumActions.EDIT_ALBUM
  ],
  [AlbumActionsGroups.ENQUEUE]: [
    AlbumActions.ENQUEUE_AFTER_CURRENT,
    AlbumActions.ENQUEUE_AT_END
  ],
  [AlbumActionsGroups.QUEUE]: [
    AlbumActions.REMOVE_FROM_QUEUE
  ],
  [AlbumActionsGroups.SYSTEM]: [
    AlbumActions.REVEAL_IN_FINDER,
    AlbumActions.RELOAD_ALBUM_CONTENT
  ],
  [AlbumActionsGroups.SEARCH_ONLINE]: [
    AlbumActions.SEARCH_ON_RYM,
    AlbumActions.SEARCH_ON_DISCOGS,
    AlbumActions.SEARCH_ON_YOUTUBE
  ]
};

export type GetAlbumContextMenuParams = ActionParams & {
  type: typeof ALBUM_CONTEXT_ACTIONS;
  actionGroups: AlbumActionsGroups[];
}

export function getActionGroups({
  actionGroups = [],
  ...args
}: GetAlbumContextMenuParams): MenuItemConstructorOptions[] {
  return grouper<ActionParams>({
    actionGroups,
    actionGroupsMap,
    actionParams: args,
    actionsMap: AlbumActionsMap
  });
}
