import { getFakeArtist, getFakeRelease, getFakeTrack } from "@/test/utils";
import { statsController } from "./stats";
import { Collection, Group, SearchableEntities } from "@/types/types";
import prisma from '../db/__mocks__/prisma';

vi.mock('../db/prisma');

describe('statsController - getStats function', () => {
  const artists = [
    getFakeArtist(1, undefined, { name: 'The Lovers', releases: [] }),
    getFakeArtist(2, undefined, { name: 'The Haters', releases: [] })
  ];

  const data = {
    artist: artists,
    release: [
      getFakeRelease(1, 1, undefined, { title: 'I Love You', artist: artists[0] }),
      getFakeRelease(2, 1, undefined, { title: 'I love you', artist: artists[0] }),
      getFakeRelease(3, 2, undefined, { title: 'I Hate You', artist: artists[1] }),
      getFakeRelease(4, 1, undefined, { title: 'I Hate You', artist: artists[0] }),
    ],
    track: Array.from({ length: 5 }, (_, i) => getFakeTrack(i, i + 1, i + 1)),
    group: [] as Group[],
    collection: [] as Collection[],
  };

  it('returns the library stats', async () => {
    Object.entries(data).forEach(([key, value]) => {
      prisma[key as SearchableEntities].aggregate.mockResolvedValue({
        _count: { id: value.length },
        _avg: null,
        _sum: null,
        _min: null,
        _max: null,
      })
    });

    const { getStats } = statsController();
    const results = await getStats();

    expect(results).toMatchObject({
      artist: 2,
      release: 4,
      track: 5,
      group: 0,
      collection: 0
    });
  });
});