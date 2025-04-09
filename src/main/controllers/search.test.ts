import { getFakeArtist, getFakeRelease } from "@/test/utils";
import { searchController } from "./search";
import prisma from '../db/__mocks__/prisma';

vi.mock('../db/prisma');

describe('search - search function', () => {
  const artists = [
    getFakeArtist(1, undefined, { name: 'The Lovers', releases: [] }),
    getFakeArtist(2, undefined, { name: 'The Haters', releases: [] })
  ];
  const releases = [
    getFakeRelease(1, 1, undefined, { title: 'I Love You', artist: artists[0] }),
    getFakeRelease(2, 1, undefined, { title: 'I love you', artist: artists[0] }),
    getFakeRelease(3, 2, undefined, { title: 'I Hate You', artist: artists[1] }),
    getFakeRelease(4, 1, undefined, { title: 'I Hate You', artist: artists[0] }),
  ];

  it('returns the results for the given query string', async () => {
    prisma.release.findMany.mockImplementation(({ where }) => {
      return releases.filter(
        x => {
          return x.title.toLowerCase().includes(where.OR.at(0).title.contains.toLowerCase())
            || x.artist.name.toLowerCase().includes(where.OR.at(1).artist.name.contains.toLowerCase())
        }
      );
    })
    prisma.artist.findMany.mockImplementation(({ where }) => {
      return artists.filter(
        x => x.name.toLowerCase().includes(where.name.contains.toLowerCase())
      );
    })
    prisma.collection.findMany.mockResolvedValue([]);
    prisma.track.findMany.mockResolvedValue([]);

    const { search } = searchController();
    const results = await search('love');
    expect(results).toMatchObject([
      { id: 1, type: 'artist', links: { artist: '/artists/1' } },
      { id: 4, type: 'release', links: { artist: '/artists/1', release: '/releases/4' } },
      { id: 1, type: 'release', links: { artist: '/artists/1', release: '/releases/1' } },
      { id: 2, type: 'release', links: { artist: '/artists/1', release: '/releases/2' } },
    ]);
  });
});