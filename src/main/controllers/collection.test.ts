import { collectionController } from "./collection";
import { getFakeCollection, getFakeRelease } from "@/test/utils";
import prisma from '../db/__mocks__/prisma';
import { HasId, ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";

vi.mock('../db/prisma');
vi

const collections = Array.from({ length: 55 }, (_, i) => getFakeCollection(i + 1));

describe('getCollections function', () => {
  it('returns as many collections as per the take parameter', async () => {
    prisma.collection.findMany.mockImplementation(({ take }) => collections.slice(0, take));
    const { getCollections } = collectionController();
    const result = await getCollections({ take: 5 });
    expect(result.length).toBe(5);
  });

  it('returns max 50 collections if no take parameter is specified', async () => {
    prisma.collection.findMany.mockImplementation(({ take }) => collections.slice(0, take));
    const { getCollections } = collectionController();
    const result = await getCollections({});
    expect(result.length).toBe(50);
  });
})

describe('removeReleasesFromCollection function', () => {
  const collection = getFakeCollection(1, {
    coverReleaseId: 1,
    releases: [
      getFakeRelease(1),
      getFakeRelease(2),
      getFakeRelease(3),
    ] as ReleaseWithArtistAndTracksAndSubreleases[]
  });
  it('removes the releases by given ids from the collection', async () => {
    prisma.collection.update.mockImplementation(({ data }) => {
      return {
        ...collection,
        releases: collection.releases.filter(
          x => !(data.releases.disconnect as HasId[]).map(x => x.id).includes(x.id)
        )
      }
    });
    const { removeReleasesFromCollection } = collectionController();
    const updatedCollection = await removeReleasesFromCollection(1, [2, 3]);
    expect(updatedCollection.releases).toMatchObject([{ id: 1 }]);
  });

  it('sets the cover release to empty if the current cover release is removed', async () => {
    prisma.collection.update.mockImplementation(({ data }) => {
      if (data.coverReleaseId !== undefined) {
        return {
          ...collection,
          coverReleaseId: data.coverReleaseId
        }
      }
      return {
        ...collection,
        releases: collection.releases.filter(
          x => !(data.releases.disconnect as HasId[]).map(x => x.id).includes(x.id)
        )
      }
    });
    const { removeReleasesFromCollection } = collectionController();
    const updatedCollection = await removeReleasesFromCollection(1, [1]);
    expect(updatedCollection.coverReleaseId).toBe(null);
  });
});