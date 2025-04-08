import type { ArtistWithReleases } from "@/types/types";
import { buildMenu } from "./menu";
import { searchArtistOnRYM, searchArtistOnDiscogs } from "@/lib/external_links";
import { send, type Controllers } from "../init";

export const artistMenu = (controllers: Controllers) => (artist: ArtistWithReleases) => {
  const { id, name, releases } = artist;
  buildMenu([
    {
      label: `Reveal '${name}' in Finder`,
      click: () => controllers.system.revealEntityInFinder('artist', id)
    },
    {
      label: `Import '${name}' Covers`,
      click: async () => {
        const updatedReleases = await controllers.release.importCovers(releases);
        send('coverUpdate', updatedReleases);
      }
    },
    {
      label: `Refresh contents for all '${name}' Releases`,
      click: async () => {
        await Promise.all(releases.map(({ id }) => controllers.release.refreshReleaseContents(id)));
        send('mutate', ['artists', artist.id]);
      }
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