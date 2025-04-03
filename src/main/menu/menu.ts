import { Menu, MenuItem, dialog, BrowserWindow } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import type { Entities, CollectionWithReleases, ArtistWithReleases, ReleaseWithArtistAndTracks } from '@/types/types';
import type { QueryKey } from '@tanstack/react-query';
import { getArtistLink, getRandomLink } from '@/lib/links';
import { setArtistCoverRelease } from '../db/artist';
import { setCollectionCoverRelease } from '../db/collection';
import { getStats } from '../db/stats';
import {
  importFolder,
  openTagger,
  revealEntityInFinder,
  importCovers,
  importMissingCovers,
  refreshReleaseContents,
  withLibraryPath
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
import type { StateManager, State } from '../state';
import { send } from '../state';

export { releaseMenu, artistMenu, collectionMenu, searchResultMenu };

export function buildMenu(params: (MenuItemConstructorOptions | MenuItem)[]) {
  const menu = Menu.buildFromTemplate(params);
  menu.popup();
  return true;
}

export function getCoverReleaseEntry(release_id: number, context: CollectionWithReleases | ArtistWithReleases): MenuItemConstructorOptions {
  if (!context?._type || context?.releases.length <= 1) {
    return { type: 'separator' };
  }
  return {
    label: `Set as ${capitalize(context._type)} Cover`,
    click: async () => {
      if (context._type === 'artist') {
        await setArtistCoverRelease(context.id, release_id);
        send('mutate', [['artists', 'latest'], ['artists', context.id]]);
        return;
      }
      await setCollectionCoverRelease(context.id, release_id);
      send('mutate', [['collections', 'latest'], ['collections', context.id]]);
    }
  };
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

export function setupMenu(win: BrowserWindow, state: StateManager) {
  state.onStateChange((state) => refreshMenu(menu, state));
  win.webContents.on('did-finish-load', () => refreshMenu(menu, state.getState()));

  const menu = Menu.getApplicationMenu();

  menu.append(new MenuItem({
    id: 'artist',
    label: 'Artist',
    submenu: [
      {
        label: 'Reveal Artist in Finder',
        accelerator: 'Cmd+Shift+F',
        click: () => revealEntityInFinder('artist', state.getCurrentArtist().id)
      },
      {
        label: 'Refresh Releases',
        accelerator: 'Cmd+Shift+A',
        click: async () => {
          await Promise.all(
            state.getCurrentArtist().releases
              .filter((x: ReleaseWithArtistAndTracks) => !x.tracks.length)
              .map((x: ReleaseWithArtistAndTracks) => refreshReleaseContents(x.id))
          );
          send('mutate', ['artists', state.getCurrentArtist().id]);
        }
      },
      {
        label: 'Import missing Covers',
        accelerator: 'Cmd+Shift+C',
        click: async () => {
          const update = await importMissingCovers(state.getCurrentArtist().releases);
          send('coverUpdate', update);
        }
      },
      {
        label: 'Edit Artist',
        accelerator: 'Shift+E',
        click: () => send('openEditArtistDialog', state.getCurrentArtist()),
      },
      { type: 'separator' },
      {
        label: 'Search Artist on Discogs',
        accelerator: 'Cmd+Shift+D',
        click: () => searchArtistOnDiscogs(state.getCurrentArtist())
      },
      {
        label: 'Search Artist on RYM',
        accelerator: 'Shift+R',
        click: () => searchArtistOnRYM(state.getCurrentArtist())
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
        click: () => send('navigate', getArtistLink(state.getSelectedReleases()[0].artist))
      },
      {
        label: 'Open Release in Tagger',
        accelerator: 'Shift+T',
        click: () => openTagger(state.getSelectedReleases()[0].id)
      },
      {
        label: 'Reveal Release in Finder',
        accelerator: 'Shift+F',
        click: () => revealEntityInFinder('release', state.getSelectedReleases()[0].id)
      },
      {
        label: 'Search Release Cover',
        accelerator: 'Shift+C',
        click: async () => {
          const update = await importCovers(state.getSelectedReleases());
          send('coverUpdate', update);
        }
      },
      { type: 'separator' },
      {
        label: 'Search Release on Discogs',
        accelerator: 'Shift+D',
        click: () => searchReleaseOnDiscogs(state.getSelectedReleases()[0])
      },
      {
        label: 'Search Release on RYM',
        accelerator: 'Shift+R',
        click: () => searchReleaseOnRYM(state.getSelectedReleases()[0])
      },
      {
        id: 'editRelease',
        label: `Edit Release`,
        accelerator: 'Cmd+Shift+E',
        click: () => send('openEditReleaseDialog', state.getSelectedReleases().at(0)),
      },
      {
        id: 'groupReleases',
        label: `Group Selected Releases`,
        accelerator: 'Cmd+G',
        click: () => send('openGroupDialog', state.getSelectedReleases()),
      },
      {
        id: 'ungroupRelease',
        label: `Ungroup Selected Release`,
        accelerator: 'Cmd+Shift+G',
        visible: false,
        click: () => ungroupReleaseHandler(state.getSelectedReleases()[0])
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
            defaultPath: withLibraryPath(state.getCurrentArtist()?.path || '')
          });
          if (!folders) {
            return;
          }
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


function refreshMenu(menu: Menu, {
  isInputFocused,
  selectedReleases,
  currentArtist
}: State) {
  ['navigate', 'library'].forEach(id => {
    menu.items.find(x => x.id == id)
      .submenu.items.forEach(x => x.enabled = !isInputFocused);
  });

  menu.getMenuItemById('artist').submenu.items.forEach(
    item => {
      if (isInputFocused) {
        item.enabled = false;
        return;
      }
      item.enabled = !!currentArtist;
    }
  );

  menu.getMenuItemById('release').submenu.items.forEach(
    item => {
      if (isInputFocused) {
        item.enabled = false;
        return;
      }
      item.enabled = selectedReleases.length === 1;
    }
  );

  const groupReleasesEntry =
    menu.getMenuItemById('release').submenu.items.find(x => x.id === 'groupReleases');
  const ungroupReleasesEntry =
    menu.getMenuItemById('release').submenu.items.find(x => x.id === 'ungroupRelease');
  const isSomeReleaseMain = selectedReleases.some(x => x?.subReleases.length);

  if (isSomeReleaseMain) {
    if (selectedReleases.length > 1) {
      groupReleasesEntry.visible = true;
      groupReleasesEntry.enabled = false;
      ungroupReleasesEntry.visible = false;
      ungroupReleasesEntry.enabled = false;
    } else if (selectedReleases.length === 1) {
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
  groupReleasesEntry.enabled = selectedReleases.length > 1;
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