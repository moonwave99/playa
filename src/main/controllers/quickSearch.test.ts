import {
  getFakeArtist,
  getFakeCollection,
  getFakeRelease,
  getFakeTracksForRelease,
} from "@/test/seed";
import prisma from "../db/prisma";
import { quickSearchController } from "./quickSearch";

describe("quickSearchController - getResults function", () => {
  it("returns results for the given query", async () => {
    await prisma.artist.createMany({
      data: [
        getFakeArtist(1, {
          name: "The Lovers",
          normalizedName: "The Lovers",
        }),
        getFakeArtist(2, { name: "Love", normalizedName: "Love" }),
        getFakeArtist(3, {
          name: "The Haters",
          normalizedName: "The Haters",
        }),
      ],
    });

    await prisma.release.createMany({
      data: [
        getFakeRelease(1, {
          artist_id: 1,
          title: "Love in the time of Hate",
        }),
      ],
    });

    await prisma.track.createMany({
      data: [
        {
          ...getFakeTracksForRelease(1).at(0),
          title: "No place for Love in me",
          normalizedTitle: "No place for Love in me",
        },
      ],
    });

    await prisma.collection.createMany({
      data: [
        getFakeCollection(1, { title: "Do you Love me?" }),
        getFakeCollection(2, { title: "Love" }),
      ],
    });

    const { getResults } = quickSearchController();

    expect(await getResults({ query: "Love" })).toMatchObject([
      { id: 2, type: "artist", title: "Love" },
      { id: 1, type: "artist", title: "The Lovers" },
      { id: 1, type: "release", title: "Love in the time of Hate" },
      { id: 1, type: "track", title: "No place for Love in me" },
      { id: 2, type: "collection", title: "Love" },
      { id: 1, type: "collection", title: "Do you Love me?" },
    ]);
  });
});
