import type {
  Release,
  ReleaseWithArtistAndSubReleases,
  CollectionWithReleases,
  MenuParams,
  Collection,
  WithReleases,
  HasId,
} from "@/types/types";
import { buildMenu, getDeleteEntry, getCoverEntityEntry } from "./menu";
import { getReleaseFullTitle } from "@/lib/utils";
import {
  searchReleaseOnDiscogs,
  searchReleaseOnRYM,
} from "@/lib/external_links";

function getRemoveFromCollectionEntry(
  selection: Release[],
  collection: Collection,
  { controllers, send }: MenuParams
) {
  return {
    label: `Remove ${selection.length} Release(s) from Collection`,
    click: async () => {
      await controllers.collection.removeReleasesFromCollection(
        collection.id,
        selection.map((x) => x.id)
      );
      send("mutate", [
        ["collections", collection.id],
        ...selection.map((x) => ["releases", x.id]),
      ]);
      send("clearSelection");
    },
  };
}

function getGroupReleasesEntry(
  selection: ReleaseWithArtistAndSubReleases[],
  { openModal }: MenuParams
) {
  if (selection.some((x) => x.subReleases?.length)) {
    return null;
  }
  return {
    label: `Group ${selection.length} Releases`,
    click: () => openModal("groupReleases", { releases: { selection } }),
  };
}

export const releaseMenu =
  ({ controllers, send, openModal }: MenuParams) =>
  async (
    selection: ReleaseWithArtistAndSubReleases[],
    context?: WithReleases & { entityType: "Artist" | "Collection" | null }
  ) => {
    if (selection.length === 1) {
      const release = selection[0];
      const title = getReleaseFullTitle(release);
      buildMenu([
        {
          label: `Playback Release`,
          click: () => controllers.system.playback({ release_id: release.id }),
        },
        {
          label: `Open Release in Tagger`,
          click: () => controllers.system.openTagger(release.id),
        },
        {
          label: `Reveal Release in Finder`,
          click: () =>
            controllers.system.revealEntityInFinder("Release", release.id),
        },
        {
          label: `Search Release Cover`,
          click: () => controllers.release.importCovers([release]),
        },
        {
          label: `Delete Release Cover`,
          click: () => controllers.release.deleteCover(release),
        },
        {
          label: "Refresh Folder Contents",
          click: () =>
            controllers.importFolders.refreshReleaseContents(release.id),
        },
        release.hideOnHomepage
          ? {
              label: "Show Release on Homepage",
              click: () => controllers.release.showRelease(release.id),
            }
          : {
              label: "Hide Release from Homepage",
              click: () => controllers.release.hideRelease(release.id),
            },
        {
          id: "editRelease",
          label: `Edit Release`,
          click: () => openModal("editRelease", { release }),
        },
        {
          id: "editArtist",
          label: `Edit Artist`,
          click: () => openModal("editArtist", { artist: release.artist }),
        },
        getCoverEntityEntry({ selection_id: release.id, context, controllers }),
        release.subReleases?.length
          ? {
              label: "Ungroup Release",
              click: async () => {
                await controllers.release.unGroupRelease(release);
                send("mutate", [
                  ["releases", "latest"],
                  ["artists", release.artist_id],
                ]);
                send("clearSelection");
              },
            }
          : { type: "separator" },
        { type: "separator" },
        {
          label: "Add Release to Collection",
          click: () =>
            openModal("addReleasesToCollection", { releases: [release] }),
        },
        context?.entityType === "Collection"
          ? getRemoveFromCollectionEntry(
              selection,
              context as CollectionWithReleases,
              {
                controllers,
                send,
                openModal,
              }
            )
          : { type: "separator" },
        { type: "separator" },
        {
          label: `Search Release on RYM`,
          click: () => searchReleaseOnRYM(release),
        },
        {
          label: `Search Release on Discogs`,
          click: () => searchReleaseOnDiscogs(release),
        },
        { type: "separator" },
        getDeleteEntry({
          title,
          deleteFn: () => controllers.release.deleteRelease(release.id),
          queryKeys: [
            ["releases", "latest"],
            ["releases", release.id],
            context.entityType
              ? [`${context.entityType}s`, (context as unknown as HasId)?.id]
              : null,
          ],
        }),
      ]);
      return true;
    }

    buildMenu([
      getGroupReleasesEntry(selection, { controllers, send, openModal }) || {
        type: "separator",
      },
      {
        label: `Add ${selection.length} Releases to Collection`,
        click: () =>
          openModal("addReleasesToCollection", { releases: selection }),
      },
      context?.entityType === "Collection"
        ? getRemoveFromCollectionEntry(
            selection,
            context as CollectionWithReleases,
            { controllers, send, openModal }
          )
        : { type: "separator" },
      {
        label: `Remove ${selection.length} Releases from Library`,
        click: () =>
          controllers.release.deleteReleases(selection.map((x) => x.id)),
      },
    ]);
    return true;
  };
