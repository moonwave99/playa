import { groupController } from "./group";
import { getFakeArtist, getFakeGroup } from "@/test/utils";
import prisma from '../db/__mocks__/prisma';
import { HasId } from "@/types/types";

vi.mock('../db/prisma');

const groups = Array.from({ length: 55 }, (_, i) => getFakeGroup(i + 1));

describe('getGroups function', () => {
  it('returns as many groups as per the take parameter', async () => {
    prisma.group.findMany.mockImplementation(({ take }) => groups.slice(0, take));
    const { getGroups } = groupController();
    const result = await getGroups({ take: 5 });
    expect(result.length).toBe(5);
  });

  it('returns max 50 groups if no take parameter is specified', async () => {
    prisma.group.findMany.mockImplementation(({ take }) => groups.slice(0, take));
    const { getGroups } = groupController();
    const result = await getGroups({});
    expect(result.length).toBe(50);
  });
});

describe('removeArtistsFromGroup function', () => {
  const group = getFakeGroup(1, {
    coverArtistId: 1,
    artists: [
      getFakeArtist(1),
      getFakeArtist(2),
      getFakeArtist(3),
    ]
  });
  it('removes the artists by given ids from the group', async () => {
    prisma.group.update.mockImplementation(({ data }) => {
      return {
        ...group,
        artists: group.artists.filter(
          x => !(data.artists.disconnect as HasId[]).map(x => x.id).includes(x.id)
        )
      }
    });
    const { removeArtistsFromGroup } = groupController();
    const updatedGroup = await removeArtistsFromGroup(1, [2, 3]);
    expect(updatedGroup.artists).toMatchObject([{ id: 1 }]);
  });

  it('sets the cover artist to empty if the current cover artist is removed', async () => {
    prisma.group.update.mockImplementation(({ data }) => {
      if (data.coverArtistId !== undefined) {
        return {
          ...group,
          coverArtistId: data.coverArtistId
        }
      }
      return {
        ...group,
        artists: group.artists.filter(
          x => !(data.artists.disconnect as HasId[]).map(x => x.id).includes(x.id)
        )
      }
    });
    const { removeArtistsFromGroup } = groupController();
    const updatedGroup = await removeArtistsFromGroup(1, [1]);
    expect(updatedGroup.coverArtistId).toBe(null);
  });
});