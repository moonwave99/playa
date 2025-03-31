import { matchPath } from 'react-router';
import { Menu, MenuItem, dialog, BrowserWindow, ipcMain as ipc } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import type { ArtistWithReleasesFull, Entities, ReleaseWithArtistAndSubreleases, CollectionWithReleases, ArtistWithReleases } from '@/types/types';
import type { QueryKey } from '@tanstack/react-query';
import { getArtistLink, getRandomLink } from '@/lib/links';
import { setArtistCoverRelease, getArtist } from '../db/artist';
import { setCollectionCoverRelease } from '../db/collection';
import { getStats } from '../db/stats';
import {
  importFolder,
  openTagger,
  revealEntityInFinder,
  importCovers,
  importMissingCovers,
  refreshReleaseContents,
} from '../system';
import {
  searchReleaseOnDiscogs,
  searchReleaseOnRYM,
  searchArtistOnDiscogs,
  searchArtistOnRYM
} from '@/lib/external_links';

import { releaseMenu, ungroupReleaseHandler } from './release';
import { artistMenu } from './artist';
import { collectionMenu } from './collection';
import { searchResultMenu } from './searchResult';
import { capitalize } from 'lodash';

export { releaseMenu, artistMenu, collectionMenu, searchResultMenu };

export function buildMenu(params: (MenuItemConstructorOptions | MenuItem)[]) {
  const menu = Menu.buildFromTemplate(params);
  menu.popup();
  return true;
}

export function getCoverReleaseEntry(release_id: number, context: CollectionWithReleases | ArtistWithReleases) {
  return {
    label: `Set as ${capitalize(context._type)} Cover`,
    click: async () => {
      if (context._type === 'artist') {
        await setArtistCoverRelease(context.id, release_id);
        send('mutate', ['artists', 'latest']);
        return;
      }
      await setCollectionCoverRelease(context.id, release_id);
      send('mutate', ['collection', 'latest']);
    }
  }
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
  let selection = [] as ReleaseWithArtistAndSubreleases[];
  let artist = null as ArtistWithReleasesFull;
  let inputFocused = false;

  function refreshMenu() {
    ['navigate', 'library'].forEach(id => {
      menu.items.find(x => x.id == id)
        .submenu.items.forEach(x => x.enabled = !inputFocused);
    });

    menu.getMenuItemById('artist').submenu.items.forEach(
      item => {
        if (inputFocused) {
          item.enabled = false;
          return;
        }
        item.enabled = !!artist;
      }
    );

    menu.getMenuItemById('release').submenu.items.forEach(
      item => {
        if (inputFocused) {
          item.enabled = false;
          return;
        }
        item.enabled = selection.length === 1;
      }
    );

    const groupReleasesEntry =
      menu.getMenuItemById('release').submenu.items.find(x => x.id === 'groupReleases');
    const ungroupReleasesEntry =
      menu.getMenuItemById('release').submenu.items.find(x => x.id === 'ungroupRelease');
    const isSomeReleaseMain = selection.some(x => x?.subReleases.length);

    if (isSomeReleaseMain) {
      if (selection.length > 1) {
        groupReleasesEntry.visible = true;
        groupReleasesEntry.enabled = false;
        ungroupReleasesEntry.visible = false;
        ungroupReleasesEntry.enabled = false;
      } else if (selection.length === 1) {
        groupReleasesEntry.visible = false;
        groupReleasesEntry.enabled = false;
        ungroupReleasesEntry.visible = true;
        ungroupReleasesEntry.enabled = true;
      }
      return;
    }
    ungroupReleasesEntry.visible = false;
    ungroupReleasesEntry.enabled = false;
    groupReleasesEntry.visible = true;
    groupReleasesEntry.enabled = selection.length > 1;
  }

  ipc.on('ui', (_, message) => {
    if (message === 'clearSelection') {
      send('clearSelection');
      return;
    }
    if (message !== 'inputBlur' && message !== 'inputFocus') {
      return;
    }
    inputFocused = message === 'inputFocus';
    refreshMenu();
  });

  ipc.on('state:select', (_, newSelection) => {
    selection = newSelection;
    refreshMenu();
  });

  ipc.on('state:navigate', async (_, path: string) => {
    const artistMatch = matchPath('/artists/:id', path);
    menu.getMenuItemById('artist').submenu.items.forEach(
      item => item.enabled = !!artistMatch
    );
    if (!artistMatch) {
      artist = null;
      return;
    }
    artist = await getArtist(+artistMatch.params.id);
  });

  win.webContents.on('did-finish-load', refreshMenu);

  const menu = Menu.getApplicationMenu();

  menu.append(new MenuItem({
    id: 'artist',
    label: 'Artist',
    submenu: [
      {
        label: 'Reveal Artist in Finder',
        accelerator: 'Cmd+Shift+F',
        click: () => revealEntityInFinder('artist', artist.id)
      },
      {
        label: 'Refresh Releases',
        accelerator: 'Cmd+Shift+A',
        click: async () => {
          await Promise.all(
            artist.releases
              .filter(x => !x.tracks.length)
              .map(x => refreshReleaseContents(x.id))
          );
          send('mutate', ['artists', artist.id]);
        }
      },
      {
        label: 'Import missing Covers',
        accelerator: 'Cmd+Shift+C',
        click: async () => {
          const update = await importMissingCovers(artist.releases);
          send('coverUpdate', update);
        }
      },
      { type: 'separator' },
      {
        label: 'Search Artist on Discogs',
        accelerator: 'Cmd+Shift+D',
        click: () => searchArtistOnDiscogs(artist)
      },
      {
        label: 'Search Artist on RYM',
        accelerator: 'Shift+R',
        click: () => searchArtistOnRYM(artist)
      },
    ]
  }));

  menu.append(new MenuItem({
    id: 'release',
    label: 'Release',
    submenu: [
      {
        label: 'Go to artist page',
        accelerator: 'Shift+A',
        click: () => send('navigate', getArtistLink(selection[0].artist))
      },
      {
        label: 'Open Release in Tagger',
        accelerator: 'Shift+T',
        click: () => openTagger(selection[0].id)
      },
      {
        label: 'Reveal Release in Finder',
        accelerator: 'Shift+F',
        click: () => revealEntityInFinder('release', selection[0].id)
      },
      {
        label: 'Search Release Cover',
        accelerator: 'Shift+C',
        click: async () => {
          const update = await importCovers(selection);
          send('coverUpdate', update);
        }
      },
      { type: 'separator' },
      {
        label: 'Search Release on Discogs',
        accelerator: 'Shift+D',
        click: () => searchReleaseOnDiscogs(selection[0])
      },
      {
        label: 'Search Release on RYM',
        accelerator: 'Shift+R',
        click: () => searchReleaseOnRYM(selection[0])
      },
      {
        id: 'groupReleases',
        label: `Group Selected Releases`,
        accelerator: 'Cmd+G',
        click: () => send('openGroupDialog', selection),
      },
      {
        id: 'ungroupRelease',
        label: `Ungroup Selected Release`,
        accelerator: 'Cmd+Shift+G',
        visible: false,
        click: () => ungroupReleaseHandler(selection[0])
      }
    ]
  }));

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
        accelerator: 'Cmd+Shift+T',
        click: () => send('toggleViewMode')
      },
      {
        label: 'Toggle Sidebar',
        accelerator: 'Cmd+\\',
        click: () => send('toggleSidebar')
      },
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
    accelerator: 'Cmd+1',
    link: '/'
  },
  {
    label: 'Latest Artists',
    accelerator: 'Cmd+2',
    link: '/artists'
  },
  {
    label: 'Latest Collections',
    accelerator: 'Cmd+3',
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