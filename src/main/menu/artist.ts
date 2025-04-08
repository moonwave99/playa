import type { ArtistWithReleases, MenuParams } from "@/types/types";
import { buildMenu } from "./menu";
import { searchArtistOnRYM, searchArtistOnDiscogs } from "@/lib/external_links";

export const artistMenu = ({ controllers, send }: MenuParams) => (artist: ArtistWithReleases) => {
  const { id, name, releases } = artist;
  buildMenu([
    {
      label: `Reveal '${name}' in Finder`,
      click: () => controllers.system.revealEntityInFinder('artist', id)
    },
    {
      label: `Import '${name}' Covers`,
      click: async () => controllers.release.importCovers(releases),
    },
    {
      label: `Refresh contents for all '${name}' Releases`,
      click: () => controllers.release.refreshEntityRelease(artist),
    },
    {
      label: 'Edit Artist',
      click: () => send('openEditArtistDialog', artist),
    },
    { type: 'separator' },
    {
      label: `Search '${name}' on RYM`,
      click: () => searchArtistOnRYM(artist)
    },
    {
      label: `Search '${name}' on Discogs`,
      click: () => searchArtistOnDiscogs(artist)
    },
  ]);
  return true;
}