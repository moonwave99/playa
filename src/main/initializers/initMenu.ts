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
  IPC_PLAYBACK_PREV_TRACK,
  IPC_PLAYBACK_NEXT_TRACK,
  IPC_UI_TOGGLE_ALBUM_VIEW
} = IPC_MESSAGES;

import {
  LIBRARY,
  QUEUE,
  PLAYLIST_ALL,
  PLAYLIST_CREATE,
  PLAYLIST_SHOW
} from '../../renderer/routes';

const compactView = 0 //UIAlbumView.Compact;
const extendedView = 1 //UIAlbumView.Extended;

type InitMenuParams = {
  window: BrowserWindow;
  debug?: boolean;
}

export default function initMenu({
  window,
  debug = false
}: InitMenuParams): void {
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
      label: 'Library',
      submenu: [
        {
          label: 'Show Library',
          accelerator: 'cmd+l',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, LIBRARY)
        }
      ]
    },
    {
      label: 'Controls',
      submenu: [
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
    {
      label: 'Playlist',
      id: 'playlist',
      submenu: [
        {
          label: 'New Playlist',
          accelerator: 'cmd+n',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, PLAYLIST_CREATE)
        },
        { type: 'separator' },
        {
          label: 'Show All',
          accelerator: 'cmd+p',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, PLAYLIST_ALL)
        },
        {
          label: 'Show Playback Queue',
          accelerator: 'cmd+shift+p',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, QUEUE)
        },
        { type: 'separator' },
        {
          label: 'Show Extended View',
          id: 'show-extended',
          accelerator: 'cmd+1',
          click: (): void => window.webContents.send(IPC_UI_TOGGLE_ALBUM_VIEW, extendedView)
        },
        {
          label: 'Show Compact View',
          id: 'show-compact',
          accelerator: 'cmd+2',
          click: (): void => window.webContents.send(IPC_UI_TOGGLE_ALBUM_VIEW, compactView)
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        debug && { role: 'reload' },
        debug && { role: 'forceReload' },
        debug && { role: 'toggleDevTools' },
        debug && { type: 'separator' },
        { role : 'resetZoom' },
        { role : 'zoomIn' },
        { role : 'zoomOut' }
      ]
    },
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
    const playlistToggleViewItems = ['show-extended', 'show-compact'].map(
      id => menu.getMenuItemById('playlist').submenu.getMenuItemById(id)
    );
    if (matchPath(location, { path: PLAYLIST_SHOW }) && !matchPath(location, { path: PLAYLIST_ALL })) {
      playlistToggleViewItems.forEach(item => item.enabled = true);
    } else {
      playlistToggleViewItems.forEach(item => item.enabled = false);
    }
  });

  Menu.setApplicationMenu(menu);
}
