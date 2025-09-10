import prisma from "../db/prisma";
import { statsController } from "./stats";
import { clearPrisma } from "../../test/prisma-utils";
import {
  getFakeArtists,
  getFakeReleasesForArtist,
  getFakeTracksForRelease,
  getFakeCollections,
  getFakeGroups,
} from "../../test/seed";

afterEach(clearPrisma);

describe("statsController - getStats function", () => {
  it("returns the library stats", async () => {
    const artists = getFakeArtists({ length: 2 });
    const releases = artists.flatMap((x) => getFakeReleasesForArtist(x.id, 3));
    const tracks = releases.flatMap((x) => getFakeTracksForRelease(x.id, 5));
    const groups = getFakeGroups({ length: 3 });
    const collections = getFakeCollections({ length: 3 });

    await prisma.artist.createMany({ data: artists });
    await prisma.release.createMany({ data: releases });
    await prisma.track.createMany({ data: tracks });
    await prisma.group.createMany({ data: groups });
    await prisma.collection.createMany({ data: collections });

    const { getStats } = statsController();
    const results = await getStats();

    expect(results).toMatchObject({
      artist: 2,
      release: 6,
      track: 30,
      group: 3,
      collection: 3,
    });
  });
});
