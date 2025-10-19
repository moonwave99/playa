import type {
  Artist,
  ArtistWithReleases,
  Group,
  GroupWithArtists,
  MenuParams,
} from "@/types/types";
import { buildMenu, getCoverEntityEntry } from "./menu";
import { searchArtistOnRYM, searchArtistOnDiscogs } from "@/lib/external_links";

function getRemoveFromGroupEntry(
  artist: Artist,
  group: Group,
  { controllers, send }: Omit<MenuParams, "openModal">
) {
  return {
    label: "Remove Artist from Group",
    click: async () => {
      await controllers.group.removeArtistsFromGroup(group.id, [artist.id]);
      send("mutate", [
        ["groups", group.id],
        ["artists", artist.id],
      ]);
      send("clearSelection");
    },
  };
}

export const artistMenu =
  ({ controllers, send, openModal }: MenuParams) =>
  async (artist: ArtistWithReleases, context?: GroupWithArtists) => {
    const { id, name, releases } = artist;

    buildMenu([
      {
        label: `Reveal '${name}' in Finder`,
        click: () => controllers.system.revealEntityInFinder("Artist", id),
      },
      {
        label: `Import '${name}' Covers`,
        click: async () => controllers.release.importCovers(releases),
      },
      {
        label: `Refresh contents for all '${name}' Releases`,
        click: () => controllers.importFolders.refreshEntityRelease(artist),
      },
      {
        label: "Edit Artist",
        click: () => openModal("editArtist", { artist }),
      },
      { type: "separator" },
      {
        label: `Add Artist to Group`,
        click: () => openModal("addArtistsToGroup", { artists: [artist] }),
      },
      context?.entityType === "Group"
        ? getRemoveFromGroupEntry(artist, context, { controllers, send })
        : { type: "separator" },
      context?.entityType === "Group"
        ? getCoverEntityEntry({ selection_id: artist.id, context, controllers })
        : { type: "separator" },
      { type: "separator" },
      {
        label: `Search '${name}' on RYM`,
        click: () => searchArtistOnRYM(artist),
      },
      {
        label: `Search '${name}' on Discogs`,
        click: () => searchArtistOnDiscogs(artist),
      },
    ]);
    return true;
  };
