import { ipcRenderer as ipc, MenuItemConstructorOptions } from 'electron';
import { Action, ActionCreator, ActionGroupsMap, ActionMap, grouper } from './actionUtils';

import {
  Album,
  reloadAlbumContent,
  editAlbum
} from '../store/modules/album';

import { Artist } from '../store/modules/artist';

import {
  playTrack,
  updateQueue,
  enqueueAfterCurrent,
  enqueueAtEnd
} from '../store/modules/player';

import { Playlist } from '../store/modules/playlist';
import { Track } from '../store/modules/track';

import { IPC_MESSAGES, SEARCH_URLS } from '../../constants';
const {
  IPC_SYS_REVEAL_IN_FINDER,
  IPC_SYS_OPEN_URL
} = IPC_MESSAGES;

export type ActionParams = {
  albums: {
    album: Album;
    artist: Artist;
  }[];
  queue?: Album['_id'][];
  playlistId?: Playlist['_id'];
  trackId?: Track['_id'];
  dispatch?: Function;
}

function createSearchAction(
  searchURL: SEARCH_URLS,
  siteName: string
): ActionCreator<ActionParams> {
  return ({ albums }): Action => {
    const { title: albumTitle } = albums[0].album;
    const query = `${albums[0].artist.name} ${albumTitle}`;
    return {
      title: `Search album on ${siteName}`,
      handler(): void { ipc.send(IPC_SYS_OPEN_URL, searchURL, query) }
    };
  }
}

function createSearchArtistAction(
  searchURL: SEARCH_URLS,
  siteName: string
): ActionCreator<ActionParams> {
  return ({ albums }): Action => {
    const query = `${albums[0].artist.name}`;
    return {
      title: `Search artist on ${siteName}`,
      handler(): void { ipc.send(IPC_SYS_OPEN_URL, searchURL, query) }
    };
  }
}

export const playAlbumAction: ActionCreator<ActionParams> = ({
  albums,
  queue,
  playlistId,
  trackId,
  dispatch
}) => {
  const { _id: albumId } = albums[0].album;
  return {
    title: 'Play album',
    handler(): void {
      dispatch(updateQueue(queue));
      dispatch(playTrack({ playlistId, albumId, trackId }))
    }
  };
}

export const editAlbumAction: ActionCreator<ActionParams> = ({
  albums,
  dispatch
}) => {
  return {
    title: 'Edit album',
    handler(): void {
      dispatch(editAlbum(albums[0].album));
    }
  };
}

export const enqueueAfterCurrentAction: ActionCreator<ActionParams> = ({
  albums,
  dispatch
}) => {
  return {
    title: 'Enqueue after current album',
    handler(): void { dispatch(enqueueAfterCurrent(albums.map(({ album }) => album._id))) }
  };
}

export const enqueueAtEndAction: ActionCreator<ActionParams> = ({
  albums,
  dispatch
}) => {
  return {
    title: 'Enqueue at the end',
    handler(): void { dispatch(enqueueAtEnd(albums.map(({ album }) => album._id))) }
  };
}

export const removeFromQueueAction: ActionCreator<ActionParams> = ({
  albums,
  queue,
  dispatch
}) => {
  return {
    title: 'Remove from queue',
    handler(): void {
      const albumIDs = albums.map(({ album }) => album._id);
      const updatedQueue = queue.filter(_id => albumIDs.indexOf(_id) === -1);
      dispatch(updateQueue(updatedQueue));
    }
  };
}

export const revealInFinderAction: ActionCreator<ActionParams> = ({ albums }) => {
  const { path } = albums[0].album;
  return {
    title: 'Reveal album in Finder',
    handler(): void { ipc.send(IPC_SYS_REVEAL_IN_FINDER, path) }
  };
}

export const reloadAlbumContentAction: ActionCreator<ActionParams> = ({ albums, dispatch }) => {
  return {
    title: 'Reload album tracks',
    handler(): Function { return dispatch(reloadAlbumContent(albums[0].album)) }
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

export type GetAlbumContextMenuParams = {
  type: typeof ALBUM_CONTEXT_ACTIONS;
  queue?: Album['_id'][];
  actionGroups: AlbumActionsGroups[];
  albums: {
    album: Album;
    artist: Artist;
  }[];
  dispatch?: Function;
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
