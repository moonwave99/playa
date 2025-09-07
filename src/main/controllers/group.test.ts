import prisma from "../db/prisma";
import { getFakeGroups, getFakeArtists } from "../../test/seed";
import { groupController } from "./group";
import { clearPrisma } from "../../test/prisma-utils";

afterEach(clearPrisma);

describe("getGroups function", () => {
  it("returns as many groups as per the take parameter", async () => {
    await prisma.group.createMany({ data: getFakeGroups({ length: 10 }) });
    const { getGroups } = groupController();
    const result = await getGroups({ take: 5 });
    expect(result.length).toBe(5);
  });

  it("returns max 50 groups if no take parameter is specified", async () => {
    await prisma.group.createMany({ data: getFakeGroups({ length: 100 }) });
    const { getGroups } = groupController();
    const result = await getGroups({});
    expect(result.length).toBe(50);
  });
});

describe("addArtistsToGroup function", async () => {
  it("adds the artists by given ids from the group", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });
    await prisma.group.create({
      data: getFakeGroups({ length: 1 }).at(0),
    });
    const { addArtistsToGroup } = groupController();
    await addArtistsToGroup(1, artists);
    const updatedGroup = await prisma.group.findFirst({
      where: { id: 1 },
      include: { artists: true },
    });
    expect(updatedGroup.artists).toMatchObject(artists);
  });

  it("sets the cover artist to empty if the current cover artist is removed", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });
    await prisma.group.createMany({
      data: getFakeGroups({ length: 1, artists }),
    });
    const { removeArtistsFromGroup } = groupController();
    const updatedGroup = await removeArtistsFromGroup(1, [1]);
    expect(updatedGroup.coverArtistId).toBe(null);
  });
});

describe("removeArtistsFromGroup function", async () => {
  it("removes the artists by given ids from the group", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });
    await prisma.group.create({
      data: getFakeGroups({ length: 1, artists }).at(0),
    });
    const { removeArtistsFromGroup } = groupController();
    const updatedGroup = await removeArtistsFromGroup(1, [2, 3]);
    expect(updatedGroup.artists).toMatchObject([{ id: 1 }]);
  });

  it("sets the cover artist to empty if the current cover artist is removed", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });
    await prisma.group.createMany({
      data: getFakeGroups({ length: 1, artists }),
    });
    const { removeArtistsFromGroup } = groupController();
    const updatedGroup = await removeArtistsFromGroup(1, [1]);
    expect(updatedGroup.coverArtistId).toBe(null);
  });
});
