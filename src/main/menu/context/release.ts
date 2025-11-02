import type {
  Release,
  ReleaseWithArtistAndSubReleases,
  CollectionWithReleases,
  MenuParams,
  Collection,
  WithReleases,
} from "@/types/types";
import { buildMenu, getCoverEntityEntry } from "../menu";
import {
  searchReleaseOnDiscogs,
  searchReleaseOnRYM,
  searchReleaseOnYouTube,
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
    context?: WithReleases & { entityType: "artist" | "collection" | null }
  ) => {
    if (selection.length === 1) {
      const release = selection[0];
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
          click: () => controllers.system.revealEntityInFinder(release),
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
          click: () => openModal("editRelease", { id: release.id }),
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
        context?.entityType === "collection"
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
          label: `Search Release on RateYourMusic`,
          click: () => searchReleaseOnRYM(release),
        },
        {
          label: `Search Release on Discogs`,
          click: () => searchReleaseOnDiscogs(release),
        },
        {
          label: `Search Release on YouTube`,
          click: () => searchReleaseOnYouTube(release),
        },
        { type: "separator" },
        {
          label: `Delete Release`,
          click: () => controllers.release.deleteReleases([release.id]),
        },
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
      context?.entityType === "collection"
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
