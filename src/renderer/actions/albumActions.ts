import { ipcRenderer as ipc, MenuItemConstructorOptions } from 'electron';

import {
  Album,
  reloadAlbumContent
} from '../store/modules/album';

import {
  playTrack,
  enqueueAfterCurrent,
  enqueueAtEnd
} from '../store/modules/player';

import { IPC_MESSAGES, SEARCH_URLS } from '../../constants';
const {
  IPC_SYS_REVEAL_IN_FINDER,
  IPC_SYS_OPEN_URL
} = IPC_MESSAGES;

type ActionCreator = (actionParams: ActionParams) => Action;

type Action = {
  title: string;
  handler: Function;
}

type ActionParams = {
  album: Album;
  dispatch?: Function;
}

function createSearchAction(
  searchURL: SEARCH_URLS,
  siteName: string
): ActionCreator {
  return ({ album }): Action => {
    const { artist, title, } = album;
    const query = `${artist} ${title}`;
    const fullTitle = `${artist} - ${title}`;
    return {
      title: `Search '${fullTitle}' on ${siteName}`,
      handler(): void { ipc.send(IPC_SYS_OPEN_URL, searchURL, query) }
    };
  }
}

export const playbackAction: ActionCreator = ({ album, dispatch }) => {
  const { _id, artist, title } = album;
  const fullTitle = `${artist} - ${title}`;
  return {
    title: `Play '${fullTitle}'`,
    handler(): void { dispatch(playTrack({ albumId: _id })) }
  };
}

export const enqueueAfterCurrentAction: ActionCreator = ({ album, dispatch }) => {
  const { _id, artist, title } = album;
  const fullTitle = `${artist} - ${title}`;
  return {
    title: `Enqueue '${fullTitle}' after current album`,
    handler(): void { dispatch(enqueueAfterCurrent(_id)) }
  };
}

export const enqueueAtEndAction: ActionCreator = ({ album, dispatch }) => {
  const { _id, artist, title } = album;
  const fullTitle = `${artist} - ${title}`;
  return {
    title: `Enqueue '${fullTitle}' at the end`,
    handler(): void { dispatch(enqueueAtEnd(_id)) }
  };
}

export const revealInFinderAction: ActionCreator = ({ album }) => {
  const { artist, title, path } = album;
  const fullTitle = `${artist} - ${title}`;
  return {
    title: `Reveal '${fullTitle}' in Finder`,
    handler(): void { ipc.send(IPC_SYS_REVEAL_IN_FINDER, path) }
  };
}

export const reloadAlbumContentAction: ActionCreator = ({ album, dispatch }) => {
  const { artist, title } = album;
  const fullTitle = `${artist} - ${title}`;
  return {
    title: `Reload '${fullTitle}' tracks`,
    handler(): void { dispatch(reloadAlbumContent(album)) }
  };
}

export const searchOnRYMAction = createSearchAction(SEARCH_URLS.RYM, 'rateyourmusic');
export const searchOnDiscogsAction = createSearchAction(SEARCH_URLS.DISCOGS, 'Discogs');
export const searchOnYoutubeAction = createSearchAction(SEARCH_URLS.YOUTUBE, 'Youtube');

export const ALBUM_CONTEXT_ACTIONS = 'playa/context-menu/album-actions';

export enum AlbumActions {
  PLAYBACK = 'PLAYBACK',
  ENQUEUE_AFTER_CURRENT = 'ENQUEUE_AFTER_CURRENT',
  ENQUEUE_AT_END = 'ENQUEUE_AT_END',
  REVEAL_IN_FINDER = 'REVEAL_IN_FINDER',
  RELOAD_ALBUM_CONTENT = 'RELOAD_ALBUM_CONTENT',
  SEARCH_ON_RYM = 'SEARCH_ON_RYM',
  SEARCH_ON_DISCOGS = 'SEARCH_ON_DISCOGS',
  SEARCH_ON_YOUTUBE = 'SEARCH_ON_YOUTUBE'
}

export function mapAction(actionID: AlbumActions): ActionCreator {
  switch (actionID) {
    case AlbumActions.PLAYBACK:
      return playbackAction;
    case AlbumActions.ENQUEUE_AFTER_CURRENT:
      return enqueueAfterCurrentAction;
    case AlbumActions.ENQUEUE_AT_END:
      return enqueueAtEndAction;
    case AlbumActions.REVEAL_IN_FINDER:
      return revealInFinderAction;
    case AlbumActions.RELOAD_ALBUM_CONTENT:
      return reloadAlbumContentAction;
    case AlbumActions.SEARCH_ON_RYM:
      return searchOnRYMAction;
    case AlbumActions.SEARCH_ON_DISCOGS:
      return searchOnDiscogsAction;
    case AlbumActions.SEARCH_ON_YOUTUBE:
      return searchOnYoutubeAction;
  }
}

export enum AlbumActionsGroups {
  PLAYBACK,
  ENQUEUE,
  SYSTEM,
  SEARCH_ONLINE
}

export type GetAlbumContextMenuParams = {
  type: typeof ALBUM_CONTEXT_ACTIONS;
  actionGroups: AlbumActionsGroups[];
  album: Album;
  dispatch?: Function;
}

const actionGroupsMap: { [key: string]: AlbumActions[] } = {
  [AlbumActionsGroups.PLAYBACK]: [
    AlbumActions.PLAYBACK
  ],
  [AlbumActionsGroups.ENQUEUE]: [
    AlbumActions.ENQUEUE_AFTER_CURRENT,
    AlbumActions.ENQUEUE_AT_END
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

export function getActionGroups({
  actionGroups = [],
  ...args
}: GetAlbumContextMenuParams): MenuItemConstructorOptions[] {
  return actionGroups.reduce((memo, group, index, original) => [
    ...memo,
    ...actionGroupsMap[group]
      .map(mapAction)
      .map(action => {
        const { title, handler } = action(args);
        return { label: title, click: handler };
      }),
    ...index < original.length ? [{ type : 'separator'}] : []
  ], []);
}
