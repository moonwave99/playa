import type { Release, Collection, ReleaseWithArtistAndSubreleases, CollectionWithReleases, ArtistWithReleases } from "@/types/types";
import { deleteRelease, unGroupRelease } from '../db/release';

import { getAllCollections, createCollection, addReleasesToCollection, removeReleasesFromCollection } from "../db/collection";
import { getCollectionLink } from '@/lib/links';
import { playback, openTagger, refreshReleaseContents, revealEntityInFinder, importCovers } from '../system';
import { buildMenu, getDeleteEntry, getCoverReleaseEntry } from './menu';
import { send } from "../state";
import { getReleaseTitle } from '@/lib/utils';
import { searchReleaseOnDiscogs, searchReleaseOnRYM } from '@/lib/external_links';

function getAddToCollectionEntry(selection: Release[], collections: Collection[]) {
  return {
    label: `Add ${selection.length} Release(s) to Collection...`,
    submenu: collections.map(({ title, id }) => ({
      label: title,
      click: async () => {
        await addReleasesToCollection(id, selection);
        send('mutate', [
          ['collections', 'latest'],
          ['collections', id]
        ]);
      }
    }))
  }
}

function getRemoveFromCollectionEntry(selection: Release[], collection: Collection) {
  return {
    label: `Remove ${selection.length} Release(s) from Collection`,
    click: async () => {
      await removeReleasesFromCollection(collection.id, selection);
      send('mutate', [['collections', collection.id]]);
      send('clearSelection');
    }
  }
}

function getGroupReleasesEntry(selection: ReleaseWithArtistAndSubreleases[]) {
  if (selection.some(x => x.subReleases?.length)) {
    return null;
  }
  return {
    label: `Group ${selection.length} Releases`,
    click: () => send('openGroupDialog', selection)
  }
}

export async function ungroupReleaseHandler(release: ReleaseWithArtistAndSubreleases) {
  await unGroupRelease(release);
  send('mutate', [
    ['releases', 'latest'],
    ['artists', release.artist_id]
  ]);
  send('clearSelection');
}

export const releaseMenu = async (
  selection: ReleaseWithArtistAndSubreleases[],
  target_id: number,
  context?: CollectionWithReleases | ArtistWithReleases
) => {
  const collections = await getAllCollections();
  const newCollectionHandler = async () => {
    const newCollection = await createCollection({
      title: 'New Collection',
      releases: selection.map(({ id }) => id)
    });
    send('mutate', [['collections'], ['collections', 'latest']]);
    send('navigate', `${getCollectionLink(newCollection)}?new=true`);
  }

  if (selection.length === 1) {
    const release = selection[0];
    const title = `${release.artist.name} - ${getReleaseTitle(release)}`;
    buildMenu([
      {
        label: `Playback Release`,
        click: () => playback({ release_id: release.id })
      },
      {
        label: `Open Release in Tagger`,
        click: () => openTagger(release.id)
      },
      {
        label: `Reveal Release in Finder`,
        click: () => revealEntityInFinder('release', release.id)
      },
      {
        label: `Search Release Cover`,
        click: async () => {
          const update = await importCovers([release]);
          send('coverUpdate', update);
        }
      },
      {
        label: 'Refresh Folder Contents',
        click: async () => {
          await refreshReleaseContents(release.id);
          send('mutate', [
            ['releases', release.id],
            [context?._type === 'collection' ? 'collections' : 'artists', context?.id]
          ]);
        }
      },
      {
        id: 'editRelease',
        label: `Edit Release`,
        click: () => send('openEditReleaseDialog', release),
      },
      {
        id: 'editArtist',
        label: `Edit Artist`,
        click: () => send('openEditArtistDialog', release.artist),
      },
      getCoverReleaseEntry(release.id, context),
      (release.subReleases?.length ? {
        label: 'Ungroup Release',
        click: () => ungroupReleaseHandler(release)
      } : { type: 'separator' }),
      { type: 'separator' },
      {
        label: 'Add to New Collection',
        click: newCollectionHandler
      },
      getAddToCollectionEntry(selection, collections),
      context?._type === 'collection'
        ? getRemoveFromCollectionEntry(selection, context as CollectionWithReleases)
        : { type: 'separator' },
      { type: 'separator' },
      {
        label: `Search Release on RYM`,
        click: () => searchReleaseOnRYM(release)
      },
      {
        label: `Search Release on Discogs`,
        click: () => searchReleaseOnDiscogs(release)
      },
      { type: 'separator' },
      getDeleteEntry({
        title,
        deleteFn: () => deleteRelease(release.id),
        queryKeys: [
          ['releases', 'latest'],
          ['releases', release.id],
          [context?._type === 'collection' ? 'collections' : 'artists', context?.id]]
      }),
    ]);
    return true;
  }

  buildMenu([
    getGroupReleasesEntry(selection) || { type: 'separator' },
    {
      label: `Add ${selection.length} Release(s) to New Collection`,
      click: newCollectionHandler,
    },
    getAddToCollectionEntry(selection, collections),
    context?._type === 'collection'
      ? getRemoveFromCollectionEntry(selection, context as CollectionWithReleases)
      : { type: 'separator' },
    getDeleteEntry({
      title: `${selection.length} Releases`,
      deleteFn: () => Promise.all(selection.map(({ id }) => deleteRelease(id))),
      queryKeys: [
        ['releases', 'latest'],
        ...selection.flatMap(({ id, artist }) => ([
          ['releases', id],
          ['artists', artist.id]
        ]))
      ]
    }),
  ]);
  return true;
}