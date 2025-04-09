import { collectionController } from "./collection";
import { getFakeCollection } from "@/test/utils";
import prisma from '../db/__mocks__/prisma';

vi.mock('../db/prisma');

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