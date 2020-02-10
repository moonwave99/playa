import { app, Menu } from 'electron';
import { generatePath } from 'react-router-dom';
import { IPC_MESSAGES } from '../../constants';
const {
  IPC_UI_NAVIGATE_TO,
  IPC_UI_FOCUS_SEARCH,
  IPC_PLAYBACK_PREV_TRACK,
  IPC_PLAYBACK_NEXT_TRACK,
  IPC_UI_TOGGLE_ALBUM_VIEW
} = IPC_MESSAGES;

import {
  LIBRARY,
  QUEUE,
  PLAYLIST_ALL,
  PLAYLIST_SHOW,
} from '../../renderer/routes';

const compactView = 0 //UIAlbumView.Compact;
const extendedView = 1 //UIAlbumView.Extended;

export default function initMenu(window: Electron.BrowserWindow): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
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
      submenu: [
        {
          label: 'New',
          accelerator: 'cmd+n',
          click: (): void => window.webContents.send(
            IPC_UI_NAVIGATE_TO,
            generatePath(PLAYLIST_SHOW, { _id: new Date().toISOString() })
          )
        },
        { type: 'separator' },
        {
          label: 'Show All',
          accelerator: 'cmd+p',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, PLAYLIST_ALL)
        },
        {
          label: 'Show Play Queue',
          accelerator: 'cmd+0',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, QUEUE)
        },
        { type: 'separator' },
        {
          label: 'Show Extended View',
          accelerator: 'cmd+1',
          click: (): void => window.webContents.send(IPC_UI_TOGGLE_ALBUM_VIEW, extendedView)
        },
        {
          label: 'Show Compact View',
          accelerator: 'cmd+2',
          click: (): void => window.webContents.send(IPC_UI_TOGGLE_ALBUM_VIEW, compactView)
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }
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
  Menu.setApplicationMenu(menu);
}
