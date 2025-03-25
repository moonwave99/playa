import type { Release, ReleaseWithArtistAndSubreleases, CollectionWithReleases, ArtistWithReleases } from "@/types/types";
import { deleteRelease, groupReleases, unGroupReleases } from '../db/release';
import { getCollections, createCollection, updateCollection } from "../db/collection";
import { getCollectionLink } from '@/lib/links';
import { playback, openTagger, refreshReleaseContents, revealEntityInFinder, importCovers } from '../system';
import { buildMenu, getDeleteEntry, send } from './menu';
import { getReleaseTitle } from '@/lib/utils';
import { searchReleaseOnDiscogs, searchReleaseOnRYM } from '@/lib/external_links';


function getAddToCollectionEntry(selection: Release[], collections: CollectionWithReleases[]) {
  return {
    label: selection.length > 1 ? `Add ${selection.length} Releases to Collection...` : 'Add to Collection...',
    submenu: collections.map((collection: CollectionWithReleases) => ({
      label: collection.title,
      click: async () => {
        await updateCollection(collection.id, {
          title: collection.title,
          releases: [
            ...new Set([
              ...selection.map(({ id }) => id),
              ...collection.releases.map(({ id }: Release) => id),
            ]),
          ],
        });
        send('mutate', [
          ['collections', 'latest'],
          ['collections', collection.id]
        ]);
      }
    }))
  }
}

function getRemoveFromCollectionEntry(selection: Release[], collection: CollectionWithReleases) {
  return {
    label: `Remove ${selection.length} Releases from Collection`,
    click: async () => {
      const ids = selection.map(({ id }) => id);
      await updateCollection(collection.id, {
        title: collection.title,
        releases: collection.releases
          .map(({ id }: Release) => id)
          .filter((id: number) => !ids.includes(id)),
      });
      send('mutate', [['collections', collection.id]]);
      send('clearSelection');
    }
  }
}

function getGroupReleasesEntry(selection: ReleaseWithArtistAndSubreleases[], target_id: number) {
  if (selection.some(x => x.subReleases.length)) {
    return null;
  }
  return {
    label: `Group ${selection.length} Releases`,
    click: async () => {
      await groupReleases(
        target_id,
        selection
          .filter(({ id }) => id !== target_id)
          .map(({ id }) => id)
      );
      send('mutate', [
        ['releases', 'latest'],
        ['artists', selection.find(x => x.id === target_id).artist_id]
      ]);
      send('clearSelection');
    }
  }
}

function getUnGroupReleasesEntry(release: ReleaseWithArtistAndSubreleases) {
  return {
    label: `Ungroup Releases`,
    click: async () => {
      await unGroupReleases(release);
      send('mutate', [
        ['releases', 'latest'],
        ['artists', release.artist_id]
      ]);
      send('clearSelection');
    }
  }
}

export const releaseMenu = async (
  selection: ReleaseWithArtistAndSubreleases[],
  target_id: number,
  context?: CollectionWithReleases | ArtistWithReleases
) => {
  const collections = await getCollections({ take: 100 });
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
        label: `Playback '${title}'`,
        click: () => playback({ release_id: release.id })
      },
      {
        label: `Open Tagger for '${title}'`,
        click: () => openTagger(release.id)
      },
      {
        label: `Reveal '${title}' in Finder`,
        click: () => revealEntityInFinder('release', release.id)
      },
      {
        label: `Import '${title}' Cover`,
        click: () => importCovers([release], release)
      },
      {
        label: 'Refresh Folder Contents',
        click: async () => {
          await refreshReleaseContents(release.id);
          send('mutate', [
            ['releases', release.id],
            [(context as CollectionWithReleases)?.title ? 'collections' : 'artists', context?.id]
          ]);
        }
      },
      (release.subReleases.length ? getUnGroupReleasesEntry(release) : { type: 'separator' }),
      { type: 'separator' },
      {
        label: 'Add to New Collection',
        click: newCollectionHandler
      },
      getAddToCollectionEntry(selection, collections),
      (context as CollectionWithReleases)?.title
        ? getRemoveFromCollectionEntry(selection, context as CollectionWithReleases)
        : { type: 'separator' },
      { type: 'separator' },
      {
        label: `Search '${title}' on RYM`,
        click: () => searchReleaseOnRYM(release)
      },
      {
        label: `Search '${title}' on Discogs`,
        click: () => searchReleaseOnDiscogs(release)
      },
      { type: 'separator' },
      getDeleteEntry({
        title,
        deleteFn: () => deleteRelease(release.id),
        queryKeys: [
          ['releases', 'latest'],
          ['releases', release.id],
          [(context as CollectionWithReleases)?.title ? 'collections' : 'artists', context?.id]]
      }),
    ]);
    return true;
  }

  buildMenu([
    getGroupReleasesEntry(selection, target_id) || { type: 'separator' },
    {
      label: `Add ${selection.length} Releases to New Collection`,
      click: newCollectionHandler,
    },
    getAddToCollectionEntry(selection, collections),
    (context as CollectionWithReleases)?.title
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