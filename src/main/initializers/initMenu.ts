import {
  app,
  ipcMain as ipc,
  Menu,
  BrowserWindow,
  MenuItemConstructorOptions
} from 'electron';

import { matchPath } from 'react-router';

import openAboutWindow from '../lib/aboutWindow';
import { IPC_MESSAGES } from '../../constants';

const {
  IPC_UI_NAVIGATE_TO,
  IPC_UI_FOCUS_SEARCH,
  IPC_UI_LOCATION_UPDATE,
  IPC_UI_ALBUM_SELECTION_UPDATE,
  IPC_PLAYBACK_PREV_TRACK,
  IPC_PLAYBACK_NEXT_TRACK,
  IPC_PLAYBACK_CLEAR_QUEUE,
  IPC_UI_EDIT_PLAYLIST_TITLE,
  IPC_UI_EDIT_ARTIST_TITLE,
  IPC_LIBRARY_IMPORT_MUSIC,
  IPC_LIBRARY_EDIT_ALBUM,
  IPC_LIBRARY_REMOVE_ALBUMS,
  IPC_LIBRARY_REVEAL_ALBUM
} = IPC_MESSAGES;

import {
  LIBRARY,
  QUEUE,
  PLAYLIST_ALL,
  PLAYLIST_CREATE,
  PLAYLIST_SHOW,
  ARTIST_SHOW
} from '../../renderer/routes';

let selectedAlbumIDs: string[];

type InitMenuParams = {
  window: BrowserWindow;
  debug?: boolean;
}

export default function initMenu({
  window,
  debug = false
}: InitMenuParams): void {

  const getViewMenu = (debug = false): MenuItemConstructorOptions => {
    return !debug
      ? {
          label: 'View',
          submenu: [
            { role: 'reload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role : 'resetZoom' },
            { role : 'zoomIn' },
            { role : 'zoomOut' }
          ]
        }
      : {
          label: 'View',
          submenu: [
            { role : 'resetZoom' },
            { role : 'zoomIn' },
            { role : 'zoomOut' }
          ]
        };
  }

  const template: MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        {
          label: 'About Playa',
          click: (): void => { openAboutWindow() }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        {
          label: 'Search',
          accelerator: 'cmd+f',
          click: (): void => window.webContents.send(IPC_UI_FOCUS_SEARCH)
        }
      ]
    },
    {
      label: 'Playlist',
      id: 'playlist',
      submenu: [
        {
          label: 'Show All',
          accelerator: 'cmd+1',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, PLAYLIST_ALL)
        },
        { type: 'separator' },
        {
          label: 'New Playlist',
          accelerator: 'cmd+n',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, PLAYLIST_CREATE)
        },
        { type: 'separator' },
        {
          label: 'Rename Current Playlist',
          id: 'edit-title',
          click: (): void => window.webContents.send(IPC_UI_EDIT_PLAYLIST_TITLE)
        }
      ]
    },
    {
      label: 'Library',
      submenu: [
        {
          label: 'Show Library',
          accelerator: 'cmd+2',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, LIBRARY)
        },
        { type: 'separator' },
        {
          label: 'Import Music',
          accelerator: 'cmd+shift+i',
          click: (): void => window.webContents.send(IPC_LIBRARY_IMPORT_MUSIC)
        },
        { type: 'separator' },
        {
          label: 'Edit Selected Album',
          id: 'edit-album',
          enabled: false,
          accelerator: 'cmd+e',
          click: (): void => window.webContents.send(IPC_LIBRARY_EDIT_ALBUM, selectedAlbumIDs[0])
        },
        {
          label: 'Remove Selected Albums from Library',
          id: 'remove-albums',
          enabled: false,
          click: (): void => window.webContents.send(IPC_LIBRARY_REMOVE_ALBUMS, selectedAlbumIDs)
        },
        {
          label: 'Reveal Selected Album in Finder',
          id: 'reveal-album',
          enabled: false,
          accelerator: 'cmd+shift+r',
          click: (): void => window.webContents.send(IPC_LIBRARY_REVEAL_ALBUM, selectedAlbumIDs)
        },
        { type: 'separator' },
        {
          label: 'Rename Current Artist',
          id: 'rename-artist',
          click: (): void => window.webContents.send(IPC_UI_EDIT_ARTIST_TITLE)
        },
      ]
    },
    {
      label: 'Playback',
      submenu: [
        {
          label: 'Show Playback Queue',
          accelerator: 'cmd+3',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, QUEUE)
        },
        {
          label: 'Clear Playback Queue',
          click: (): void => window.webContents.send(IPC_PLAYBACK_CLEAR_QUEUE)
        },
        { type: 'separator' },
        {
          label: 'Previous Track',
          accelerator: 'cmd+left',
          click: (): void => window.webContents.send(IPC_PLAYBACK_PREV_TRACK)
        },
        {
          label: 'Next Track',
          accelerator: 'cmd+right',
          click: (): void => window.webContents.send(IPC_PLAYBACK_NEXT_TRACK)
        }
      ]
    },
    getViewMenu(debug),
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);

  ipc.on(IPC_UI_LOCATION_UPDATE, (_event, location: string) => {
    const playlistToggleViewItems = ['edit-title'].map(
      id => menu.getMenuItemById('playlist').submenu.getMenuItemById(id)
    );

    if (matchPath(location, { path: PLAYLIST_SHOW }) && !matchPath(location, { path: PLAYLIST_ALL })) {
      playlistToggleViewItems.forEach(item => item.enabled = true);
    } else {
      playlistToggleViewItems.forEach(item => item.enabled = false);
    }

    menu.getMenuItemById('rename-artist').enabled = !!matchPath(location, { path: ARTIST_SHOW });
  });

  const albumSelectionEntries = [
    {
      entry: menu.getMenuItemById('edit-album'),
      multiple: false
    },
    {
      entry: menu.getMenuItemById('reveal-album'),
      multiple: false
    },
    {
      entry: menu.getMenuItemById('remove-albums'),
      multiple: true
    },
  ];

  ipc.on(IPC_UI_ALBUM_SELECTION_UPDATE, (_event, selection: string[]) => {
    selectedAlbumIDs = selection;
    if (selection.length <= 1) {
      albumSelectionEntries
        .map(({ entry }) => entry.enabled = !!selection.length);
    } else {
      albumSelectionEntries
        .filter(({ multiple }) => multiple)
        .map(({ entry }) => entry.enabled = true);
      albumSelectionEntries
        .filter(({ multiple }) => !multiple)
        .map(({ entry }) => entry.enabled = false);
    }
  });

  Menu.setApplicationMenu(menu);
}
