import type { Release, Collection, ReleaseWithArtistAndSubreleases, CollectionWithReleases, ArtistWithReleases } from "@/types/types";
import { getCollectionLink } from '@/lib/links';
import { buildMenu, getDeleteEntry, getCoverReleaseEntry } from './menu';
import { getReleaseTitle } from '@/lib/utils';
import { searchReleaseOnDiscogs, searchReleaseOnRYM } from '@/lib/external_links';
import { send, type Controllers } from "../init";

function getAddToCollectionEntry(selection: Release[], collections: Collection[], controllers: Controllers) {
  return {
    label: `Add ${selection.length} Release(s) to Collection...`,
    submenu: collections.map(({ title, id }) => ({
      label: title,
      click: async () => {
        await controllers.collection.addReleasesToCollection(id, selection);
        send('mutate', [
          ['collections', 'latest'],
          ['collections', id]
        ]);
      }
    }))
  }
}

function getRemoveFromCollectionEntry(selection: Release[], collection: Collection, controllers: Controllers) {
  return {
    label: `Remove ${selection.length} Release(s) from Collection`,
    click: async () => {
      await controllers.collection.removeReleasesFromCollection(collection.id, selection);
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

export const releaseMenu = (controllers: Controllers) => async (
  selection: ReleaseWithArtistAndSubreleases[],
  target_id: number,
  context?: CollectionWithReleases | ArtistWithReleases
) => {
  const collections = await controllers.collection.getAllCollections();
  const newCollectionHandler = async () => {
    const newCollection = await controllers.collection.createCollection({
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
        click: () => controllers.system.playback({ release_id: release.id })
      },
      {
        label: `Open Release in Tagger`,
        click: () => controllers.system.openTagger(release.id)
      },
      {
        label: `Reveal Release in Finder`,
        click: () => controllers.system.revealEntityInFinder('release', release.id)
      },
      {
        label: `Search Release Cover`,
        click: async () => {
          const update = await controllers.release.importCovers([release]);
          send('coverUpdate', update);
        }
      },
      {
        label: 'Refresh Folder Contents',
        click: async () => {
          await controllers.release.refreshReleaseContents(release.id);
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
      getCoverReleaseEntry({ release_id: release.id, context, controllers }),
      (release.subReleases?.length ? {
        label: 'Ungroup Release',
        click: async () => {
          await controllers.release.unGroupRelease(release);
          send('mutate', [
            ['releases', 'latest'],
            ['artists', release.artist_id]
          ]);
          send('clearSelection');
        }
      } : { type: 'separator' }),
      { type: 'separator' },
      {
        label: 'Add to New Collection',
        click: newCollectionHandler
      },
      getAddToCollectionEntry(selection, collections, controllers),
      context?._type === 'collection'
        ? getRemoveFromCollectionEntry(selection, context as CollectionWithReleases, controllers)
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
        deleteFn: () => controllers.release.deleteRelease(release.id),
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
    getAddToCollectionEntry(selection, collections, controllers),
    context?._type === 'collection'
      ? getRemoveFromCollectionEntry(selection, context as CollectionWithReleases, controllers)
      : { type: 'separator' },
    getDeleteEntry({
      title: `${selection.length} Releases`,
      deleteFn: () => Promise.all(selection.map(({ id }) => controllers.release.deleteRelease(id))),
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