import { Menu, MenuItem, dialog, BrowserWindow, ipcMain as ipc } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import type { Entities } from '@/types/types';
import type { QueryKey } from '@tanstack/react-query';
import { getRandomLink } from '@/lib/links';
import { getStats } from '../db/stats';
import { importFolder } from '../system';
import { releaseMenu } from './release';
import { artistMenu } from './artist';
import { collectionMenu } from './collection';
import { searchResultMenu } from './searchResult';

export { releaseMenu, artistMenu, collectionMenu, searchResultMenu };

export function buildMenu(params: (MenuItemConstructorOptions | MenuItem)[]) {
  const menu = Menu.buildFromTemplate(params);
  menu.popup();
  return true;
}

type GetDeleteEntryParams = {
  title: string;
  deleteFn: () => Promise<unknown>;
  queryKeys: QueryKey;
};

export function getDeleteEntry({ title, deleteFn, queryKeys }: GetDeleteEntryParams) {
  return {
    label: `Remove '${title}' from Library`,
    click: async () => {
      const cancel = dialog.showMessageBoxSync(null, {
        message: `Are you sure to delete ${title}?`,
        detail: 'This action is not reversible!',
        type: 'warning',
        buttons: ['OK', 'Cancel'],
        defaultId: 1,
      });
      if (cancel) {
        return;
      }
      await deleteFn();
      send('mutate', queryKeys);
      send('clearSelection');
    }
  }
}

export function send(channel: string, ...args: unknown[]) {
  BrowserWindow.getAllWindows()[0].webContents.send(channel, ...args);
}

export function setupMenu(win: BrowserWindow) {
  ipc.on('ui', (_, message) => {
    if (message !== 'inputBlur' && message !== 'inputFocus') {
      return;
    }
    ['navigate', 'library'].forEach(id => {
      menu.items.find(x => x.id == id)
        .submenu.items.forEach(x => x.enabled = message === 'inputBlur');
    });
  });

  const menu = Menu.getApplicationMenu();

  menu.append(new MenuItem({
    id: 'navigate',
    label: 'Navigate',
    submenu: [
      ...navigateMenu.map(({ label, accelerator, link }) => ({
        label,
        accelerator,
        click: () => send('navigate', link)
      })),
      {
        label: 'Settings',
        accelerator: 'cmd+,',
        click: () => send('openSettings')
      }
    ]
  }));

  menu.append(new MenuItem({
    id: 'library',
    label: 'Library',
    submenu: [
      {
        label: 'Import Folder',
        accelerator: 'Shift+I',
        click: async () => {
          const folders = dialog.showOpenDialogSync(win, {
            properties: ['openDirectory', 'multiSelections'],
          });
          const releases = await Promise.all(folders.map(importFolder));
          send('mutate', [
            ['releases', 'latest'],
            ...releases.flat().map(x => (['artists', x.artist_id]))
          ]);
        }
      },
      { type: 'separator' },
      ...randomMenu.map(({ label, accelerator, entity }) => ({
        label,
        accelerator,
        click: async () => {
          const stats = await getStats();
          send('navigate', getRandomLink(stats, entity));
        }
      })),
      { type: 'separator' },
      {
        label: 'Toggle View Mode',
        accelerator: 'Shift+T',
        click: () => send('toggleViewMode')
      }
    ]
  }));
  Menu.setApplicationMenu(menu);
}

type MenuEntry = {
  label: string;
  accelerator: string;
};

const navigateMenu: (MenuEntry & { link: string })[] = [
  {
    label: 'Latest Releases',
    accelerator: 'Shift+R',
    link: '/'
  },
  {
    label: 'Latest Artists',
    accelerator: 'Shift+A',
    link: '/artists'
  },
  {
    label: 'Latest Collections',
    accelerator: 'Shift+C',
    link: '/collections'
  },
];

const randomMenu: (MenuEntry & { entity: Entities })[] = [
  {
    label: 'Show Random Release',
    accelerator: 'Alt+R',
    entity: 'release',
  },
  {
    label: 'Show Random Artist',
    accelerator: 'Alt+A',
    entity: 'artist',
  },
  {
    label: 'Show Random Collection',
    accelerator: 'Alt+C',
    entity: 'collection',
  },
];