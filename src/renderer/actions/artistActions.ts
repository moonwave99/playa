import { ipcRenderer as ipc, MenuItemConstructorOptions } from 'electron';
import { Action, ActionCreator, ActionGroupsMap, ActionMap, grouper } from './actionUtils';

import { Artist } from '../store/modules/artist';

import { IPC_MESSAGES, SEARCH_URLS } from '../../constants';
const { IPC_SYS_OPEN_URL } = IPC_MESSAGES;

export type ActionParams = {
  artist: Artist;
  dispatch?: Function;
}

function createSearchAction(
  searchURL: SEARCH_URLS,
  siteName: string
): ActionCreator<ActionParams> {
  return ({ artist }): Action => {
    return {
      title: `Search artist on ${siteName}`,
      handler(): void { ipc.send(IPC_SYS_OPEN_URL, searchURL, artist.name) }
    };
  }
}

export const searchOnRYMAction = createSearchAction(SEARCH_URLS.RYM_ARTIST, 'rateyourmusic');
export const searchOnDiscogsAction = createSearchAction(SEARCH_URLS.DISCOGS, 'Discogs');
export const searchOnYoutubeAction = createSearchAction(SEARCH_URLS.YOUTUBE, 'Youtube');

export const ARTIST_CONTEXT_ACTIONS = 'playa/context-menu/artist-actions';

export enum ArtistActions {
  SEARCH_ARTIST_ON_RYM = 'SEARCH_ARTIST_ON_RYM',
  SEARCH_ARTIST_ON_DISCOGS = 'SEARCH_ARTIST_ON_DISCOGS',
  SEARCH_ARTIST_ON_YOUTUBE = 'SEARCH_ARTIST_ON_YOUTUBE',
}

export const ArtistActionsMap: ActionMap<ActionParams> = {
  [ArtistActions.SEARCH_ARTIST_ON_RYM]: searchOnRYMAction,
  [ArtistActions.SEARCH_ARTIST_ON_DISCOGS]: searchOnDiscogsAction,
  [ArtistActions.SEARCH_ARTIST_ON_YOUTUBE]: searchOnYoutubeAction
}

export enum ArtistActionsGroups {
  SEARCH_ONLINE = 'SEARCH_ONLINE'
}

const actionGroupsMap: ActionGroupsMap = {
  [ArtistActionsGroups.SEARCH_ONLINE]: [
    ArtistActions.SEARCH_ARTIST_ON_RYM,
    ArtistActions.SEARCH_ARTIST_ON_DISCOGS,
    ArtistActions.SEARCH_ARTIST_ON_YOUTUBE
  ]
};

export type GetArtistContextMenuParams = {
  type: typeof ARTIST_CONTEXT_ACTIONS;
  actionGroups?: ArtistActionsGroups[];
  artist: Artist;
  dispatch?: Function;
}

export function getActionGroups({
  actionGroups,
  ...args
}: GetArtistContextMenuParams): MenuItemConstructorOptions[] {
  return grouper<ActionParams>({
    actionGroups,
    actionGroupsMap,
    actionParams: args,
    actionsMap: ArtistActionsMap
  });
}
