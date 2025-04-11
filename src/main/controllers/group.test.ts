import { groupController } from "./group";
import { getFakeGroup } from "@/test/utils";
import prisma from '../db/__mocks__/prisma';

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
})