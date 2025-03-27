import type { ArtistWithReleases } from "@/types/types";
import { buildMenu, send } from "./menu";
import { revealEntityInFinder, importCovers, refreshReleaseContents } from "../system";
import { searchArtistOnRYM, searchArtistOnDiscogs } from "@/lib/external_links";

export const artistMenu = (artist: ArtistWithReleases) => {
  const { id, name, releases } = artist;
  buildMenu([
    {
      label: `Reveal '${name}' in Finder`,
      click: () => revealEntityInFinder('artist', id)
    },
    {
      label: `Import '${name}' Covers`,
      click: async () => {
        const updatedReleases = await importCovers(releases);
        send('coverUpdate', updatedReleases);
      }
    },
    {
      label: `Refresh contents for all '${name}' Releases`,
      click: async () => {
        await Promise.all(releases.map(({ id }) => refreshReleaseContents(id)));
        send('mutate', ['artists', artist.id]);
      }
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