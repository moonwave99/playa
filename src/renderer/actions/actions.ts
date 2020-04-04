import { ActionCreator } from './actionUtils';

import {
  AlbumActions,
  AlbumActionsMap,
  ActionParams as AlbumActionParams
} from './albumActions';

import {
  ArtistActions,
  ArtistActionsMap,
  ActionParams as ArtistActionParams
} from './artistActions';

import {
  LibraryContentActions,
  LibraryContentActionsMap,
  ActionParams as LibraryActionParams
} from './libraryContentActions';

import {
  PlaylistContentActions,
  PlaylistContentActionsMap,
  ActionParams as PlaylistContentActionParams
} from './playlistContentActions';

import {
  PlaylistListActions,
  PlaylistListActionsMap,
  ActionParams as PlaylistListActionParams
} from './playlistListActions';

export type AllActions =
    AlbumActions
  | ArtistActions
  | LibraryContentActions
  | PlaylistContentActions
  | PlaylistListActions;

type AllParams =
    AlbumActionParams
  | ArtistActionParams
  | LibraryActionParams
  | PlaylistContentActionParams
  | PlaylistListActionParams;

const megaMap: { [key: string]: ActionCreator<AllParams> } =
  [
    AlbumActionsMap,
    ArtistActionsMap,
    LibraryContentActionsMap,
    PlaylistContentActionsMap,
    PlaylistListActionsMap
  ].reduce((memo, map) => ({ ...memo, ...map}), {});

export default function actionsMap(action: AllActions): ActionCreator<AllParams> {
  return megaMap[action];
}
