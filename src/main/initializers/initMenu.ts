import { app, Menu } from 'electron';
import { generatePath } from 'react-router-dom';
import { IPC_MESSAGES } from '../../constants';
const {
  IPC_UI_NAVIGATE_TO,
  IPC_UI_TOGGLE_ALBUM_VIEW
} = IPC_MESSAGES;

import {
  QUEUE,
  SEARCH,
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
        { role: 'selectAll' },
        {
          label: 'Search',
          accelerator: 'cmd+f',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, SEARCH)
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
