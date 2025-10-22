import prisma from "../db/prisma";
import { clearPrisma } from "../../test/prisma-utils";
import { getFakeGroups, getFakeArtists } from "../../test/seed";
import { groupController } from "./group";
import { sortBy } from "@/lib/utils";

afterEach(clearPrisma);

const defaultParams = {
  send: vi.fn(),
  openConfirmDialog: () => true,
};

describe("getGroups function", () => {
  it("returns as many groups as per the take parameter", async () => {
    await prisma.group.createMany({ data: getFakeGroups({ length: 10 }) });
    const { getGroups } = groupController(defaultParams);
    const result = await getGroups({ take: 5 });
    expect(result.length).toBe(5);
  });

  it("returns max 50 groups if no take parameter is specified", async () => {
    await prisma.group.createMany({ data: getFakeGroups({ length: 100 }) });
    const { getGroups } = groupController(defaultParams);
    const result = await getGroups({});
    expect(result.length).toBe(50);
  });
});

describe("getAllGroups function", () => {
  it("returns all groups", async () => {
    const groups = getFakeGroups({ length: 10 });
    await prisma.group.createMany({ data: groups });
    const { getAllGroups } = groupController(defaultParams);
    const result = await getAllGroups();
    expect(result).toMatchObject(
      (groups as { title: string }[]).toSorted(sortBy("title"))
    );
  });
});

describe("getGroup function", () => {
  it("returns null if no group is found", async () => {
    const { getGroup } = groupController(defaultParams);
    const result = await getGroup(1);
    expect(result).toBe(null);
  });

  it("returns the group by given id", async () => {
    const groups = getFakeGroups({ length: 10 });
    await prisma.group.createMany({ data: groups });
    const { getGroup } = groupController(defaultParams);
    const result = await getGroup(1);
    expect(result).toMatchObject(groups[0]);
  });
});

describe("createGroup function", () => {
  it("creates a new group", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });
    const { createGroup } = groupController(defaultParams);
    await createGroup({
      title: "new group",
      artists: artists.map(({ id }) => id),
    });

    const group = await prisma.group.findFirst({
      where: { id: 1 },
      include: { artists: true },
    });
    expect(group).toMatchObject({
      title: "new group",
      artists,
    });
  });
});

describe("updateGroup function", () => {
  it("does nothing if no group is found", async () => {
    const send = vi.fn();
    const { updateGroup } = groupController({ ...defaultParams, send });
    const result = await updateGroup(1, {
      title: "new title",
      artists: [],
    });
    expect(result).toBe(null);
    expect(send).not.toHaveBeenCalled();
  });

  it("updates the group with the given information", async () => {
    const group = getFakeGroups({ length: 1 }).at(0);
    const artists = getFakeArtists({ length: 5 });
    await prisma.artist.createMany({ data: artists });
    await prisma.group.create({
      data: {
        ...group,
        artists: {
          connect: [{ id: 1 }, { id: 2 }],
        },
      },
    });

    const send = vi.fn();
    const { updateGroup } = groupController({ ...defaultParams, send });
    await updateGroup(1, {
      title: "new title",
      artists: [3, 4],
    });

    const updatedGroup = await prisma.group.findFirst({
      where: { id: 1 },
      include: { artists: true },
    });

    expect(updatedGroup).toMatchObject({
      title: "new title",
      artists: [{ id: 3 }, { id: 4 }],
    });

    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: "Group updated",
    });
  });
});

describe("addArtistsToGroup function", () => {
  it("does nothing if no group is found", async () => {
    const artists = getFakeArtists({ length: 5 });
    await prisma.artist.createMany({ data: artists });
    const send = vi.fn();
    const { addArtistsToGroup } = groupController({ ...defaultParams, send });
    const result = await addArtistsToGroup(1, artists);
    expect(result).toBe(null);
    expect(send).not.toHaveBeenCalled();
  });

  it("adds the passed artists to the group", async () => {
    const group = getFakeGroups({ length: 1 }).at(0);
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });
    await prisma.group.create({
      data: group,
    });

    const send = vi.fn();
    const { addArtistsToGroup } = groupController({ ...defaultParams, send });
    await addArtistsToGroup(1, artists);

    const updatedGroup = await prisma.group.findFirst({
      where: { id: 1 },
      include: { artists: true },
    });

    expect(updatedGroup).toMatchObject({
      artists: [{ id: 1 }, { id: 2 }],
    });

    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: "Artists added to Group",
    });
  });
});

describe("addArtistsToNewGroup function", () => {
  it("adds the passed artists to a  new group", async () => {
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });

    const send = vi.fn();
    const { addArtistsToNewGroup } = groupController({
      ...defaultParams,
      send,
    });
    await addArtistsToNewGroup("New Group", artists);

    const updatedGroup = await prisma.group.findFirst({
      where: { id: 1 },
      include: { artists: true },
    });

    expect(updatedGroup).toMatchObject({
      title: "New Group",
      artists: [{ id: 1 }, { id: 2 }],
    });

    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: "Artists added to Group",
    });
  });
});

describe("deleteGroup function", () => {
  it("deletes a group by the given id", async () => {
    const group = getFakeGroups({ length: 1 }).at(0);
    await prisma.group.create({ data: group });

    const { deleteGroup } = groupController(defaultParams);
    await deleteGroup(1);
    const result = await prisma.group.findFirst({ where: { id: 1 } });

    expect(result).toBe(null);
  });
});

describe("deleteGroups function", () => {
  it("deletes all groups by the given ids", async () => {
    const groups = getFakeGroups({ length: 3 });
    await prisma.group.createMany({ data: groups });

    const { deleteGroups } = groupController(defaultParams);
    await deleteGroups([2, 3]);
    const result = await prisma.group.findMany();

    expect(result).toMatchObject(groups.slice(0, 1));
  });
});

describe("addArtistsToGroup function", async () => {
  it("adds the artists by given ids to the group", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });
    await prisma.group.create({
      data: getFakeGroups({ length: 1 }).at(0),
    });
    const { addArtistsToGroup } = groupController(defaultParams);
    await addArtistsToGroup(1, artists);
    const updatedGroup = await prisma.group.findFirst({
      where: { id: 1 },
      include: { artists: true },
    });
    expect(updatedGroup.artists).toMatchObject(artists);
  });
});

describe("addArtistsToNewGroup function", async () => {
  it("adds the artists by given ids to a new group", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });
    const { addArtistsToNewGroup } = groupController(defaultParams);
    await addArtistsToNewGroup("new group", artists);

    const newGroup = await prisma.group.findFirst({
      where: { id: 1 },
      include: { artists: true },
    });
    expect(newGroup.title).toBe("new group");
    expect(newGroup.artists).toMatchObject(artists);
  });
});

describe("removeArtistsFromGroup function", async () => {
  it("does nothing if the cancel button is pressed", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });
    await prisma.group.create({
      data: getFakeGroups({ length: 1, artists }).at(0),
    });

    const { removeArtistsFromGroup } = groupController({
      ...defaultParams,
      openConfirmDialog: () => false,
    });
    await removeArtistsFromGroup(1, [2]);

    const result = await prisma.group.findFirst({
      where: { id: 1 },
      include: { artists: true },
    });

    expect(result.artists.length).toBe(artists.length);
  });

  it("removes the artists by given ids from the group", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });
    await prisma.group.create({
      data: getFakeGroups({ length: 1, artists }).at(0),
    });
    const { removeArtistsFromGroup } = groupController(defaultParams);
    const updatedGroup = await removeArtistsFromGroup(1, [2, 3]);
    expect(updatedGroup.artists).toMatchObject([{ id: 1 }]);
  });

  it("sets the cover artist to empty if the current cover artist is removed", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });
    await prisma.group.createMany({
      data: getFakeGroups({ length: 1, artists }),
    });
    const { removeArtistsFromGroup } = groupController(defaultParams);
    const updatedGroup = await removeArtistsFromGroup(1, [1]);
    expect(updatedGroup.coverArtistId).toBe(null);
  });
});

describe("setGroupCoverArtist function", () => {
  it("sets the group cover", async () => {
    const group = getFakeGroups({ length: 1 }).at(0);
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });
    await prisma.group.create({
      data: {
        ...group,
        artists: {
          connect: [{ id: 1 }],
        },
        coverArtistId: 1,
      },
    });
    const { setGroupCoverArtist } = groupController(defaultParams);
    const updatedGroup = await setGroupCoverArtist(1, 2);
    expect(updatedGroup.coverArtistId).toBe(2);
  });
});
