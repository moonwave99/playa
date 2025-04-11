import type { Artist, ArtistWithReleases, Group, GroupWithArtists, MenuParams } from "@/types/types";
import { buildMenu, getCoverEntityEntry } from "./menu";
import { searchArtistOnRYM, searchArtistOnDiscogs } from "@/lib/external_links";
import { getGroupLink } from "@/lib/links";

function getAddToGroupEntry(artist: Artist, groups: GroupWithArtists[], { controllers, send }: MenuParams) {
  return {
    label: 'Add Artist to Group...',
    submenu: groups
      .filter(g => !g.artists.find(a => a.id === artist.id))
      .map(({ title, id }) => ({
        label: title,
        click: async () => {
          await controllers.group.addArtistsToGroup(id, [artist]);
          send('mutate', [
            ['groups', 'latest'],
            ['groups', id]
          ]);
        }
      }))
  }
}

function getRemoveFromGroupEntry(artist: Artist, group: Group, { controllers, send }: MenuParams) {
  return {
    label: 'Remove Artist from Group',
    click: async () => {
      await controllers.group.removeArtistsFromGroup(group.id, [artist]);
      send('mutate', [['groups', group.id]]);
      send('clearSelection');
    }
  }
}

export const artistMenu = ({ controllers, send }: MenuParams) => async (
  artist: ArtistWithReleases, context?: GroupWithArtists
) => {
  const { id, name, releases } = artist;
  const groups = await controllers.group.getAllGroups();

  const newGroupHandler = async () => {
    const newGroup = await controllers.group.createGroup({
      title: 'New Group',
      artists: [artist.id]
    });
    send('mutate', [['groups'], ['groups', 'latest']]);
    send('navigate', `${getGroupLink(newGroup)}?new=true`);
  }

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
      label: 'Add to New Group',
      click: newGroupHandler
    },
    groups.length
      ? getAddToGroupEntry(artist, groups, { controllers, send })
      : { type: 'separator' },
    context?._type === 'group'
      ? getRemoveFromGroupEntry(artist, context, { controllers, send })
      : { type: 'separator' },
    context?._type === 'group'
      ? getCoverEntityEntry({ selection_id: artist.id, context, controllers })
      : { type: 'separator' },
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