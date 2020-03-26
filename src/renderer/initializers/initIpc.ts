import { History } from 'history';
import { Store } from 'redux';
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { getFromList } from '../utils/storeUtils';
import { setEditPlaylistTitle, setEditArtistTitle } from '../store/modules/ui';
import { Album, editAlbum } from '../store/modules/album';
import { Artist } from '../store/modules/artist';
import {
  playPreviousTrack,
  playNextTrack,
  updateQueue
} from '../store/modules/player';

import { revealInFinderAction } from '../actions/albumActions';
import { removeAlbumsAction } from '../actions/libraryContentActions';

import { IPC_MESSAGES } from '../../constants';

const {
  IPC_ERROR,
  IPC_UI_NAVIGATE_TO,
  IPC_UI_FOCUS_SEARCH,
  IPC_PLAYBACK_PREV_TRACK,
  IPC_PLAYBACK_NEXT_TRACK,
  IPC_PLAYBACK_CLEAR_QUEUE,
  IPC_UI_SWIPE,
  IPC_UI_EDIT_PLAYLIST_TITLE,
  IPC_UI_EDIT_ARTIST_TITLE,
  IPC_LIBRARY_IMPORT_MUSIC,
  IPC_LIBRARY_EDIT_ALBUM,
  IPC_LIBRARY_REMOVE_ALBUMS,
  IPC_LIBRARY_REVEAL_ALBUM
} = IPC_MESSAGES;

type InitIpcParams = {
  history: History;
  dispatch: Function;
  store: Store;
  focusSearchHandler: (_event: IpcRendererEvent) => void;
  importMusicHandler: Function;
}

export default function initIpc({
  history,
  dispatch,
  store,
  focusSearchHandler,
  importMusicHandler
}: InitIpcParams): Function {
  const handlerMap = {
    [IPC_ERROR]: (_event: IpcRendererEvent, error: Error): void => console.log('[ipc]', error),
    [IPC_UI_NAVIGATE_TO]: (_event: IpcRendererEvent, path: string): void => history.replace(path),
    [IPC_UI_FOCUS_SEARCH]: focusSearchHandler,
    [IPC_PLAYBACK_PREV_TRACK]: (): void => dispatch(playPreviousTrack()),
    [IPC_PLAYBACK_NEXT_TRACK]: (): void => dispatch(playNextTrack()),
    [IPC_PLAYBACK_CLEAR_QUEUE]: (): void => dispatch(updateQueue([])),
    [IPC_UI_SWIPE]: (_event: IpcRendererEvent, direction: string): void => {
      if (direction === 'left') {
        history.goBack();
      } else {
        history.goForward();
      }
    },
    [IPC_LIBRARY_IMPORT_MUSIC]: (): void => importMusicHandler(),
    [IPC_LIBRARY_EDIT_ALBUM]: (_event: IpcRendererEvent, albumId: Album['_id']): void =>
      dispatch(editAlbum({ _id: albumId } as Album)),
    [IPC_LIBRARY_REMOVE_ALBUMS]: (_event: IpcRendererEvent, selection: Album['_id'][]): void => {
      const { player, albums } = store.getState();
      removeAlbumsAction({
        selection: getFromList(albums.allById, selection),
        currentAlbumId: player.currentAlbumId,
        dispatch
      }).handler();
    },
    [IPC_LIBRARY_REVEAL_ALBUM]: (_event: IpcRendererEvent, selection: Album['_id'][]): void => {
      const { albums } = store.getState();
      revealInFinderAction({
        albums: [{
          album: getFromList(albums.allById, [selection[0]])[0] as Album,
          artist: {} as Artist
        }],
        dispatch
      }).handler();
    },
    [IPC_UI_EDIT_PLAYLIST_TITLE]: (): void => dispatch(setEditPlaylistTitle(true)),
    [IPC_UI_EDIT_ARTIST_TITLE]: (): void => dispatch(setEditArtistTitle(true))
  }

  const entries = Object.entries(handlerMap);
  entries.forEach(
    ([event, handler]) => ipc.on(event, handler)
  );

  return (): void => entries.forEach(
    ([event, handler]) => ipc.removeListener(event, handler)
  );
}
