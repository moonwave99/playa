import prisma from "../db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
import {
  getFakeArtist,
  getFakeCollections,
  getFakeGroups,
  getFakeReleasesForArtist,
  getFakeTracksForRelease,
} from "../../test/seed";
import { searchResultController } from "./searchResult";

afterEach(clearPrisma);

describe("searchResult - search function", () => {
  it("returns the results for the given query string", async () => {
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.createMany({ data: getFakeReleasesForArtist(1, 2) });

    const { getSearchResults } = searchResultController();
    const results = await getSearchResults({ query: "Release" });

    expect(results).toMatchObject([
      {
        id: 1,
        type: "release",
        links: { artist: "/artists/1", release: "/releases/1" },
      },
      {
        id: 2,
        type: "release",
        links: { artist: "/artists/1", release: "/releases/2" },
      },
    ]);
  });

  it("returns the tracks for the given query string", async () => {
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.createMany({ data: getFakeReleasesForArtist(1, 2) });
    await prisma.track.createMany({ data: getFakeTracksForRelease(1, 3) });

    const { getSearchResults } = searchResultController();
    const results = await getSearchResults({ query: "Track" });

    expect(results).toMatchObject([
      {
        id: 1,
        type: "track",
        links: { artist: "/artists/1", track: "/releases/1?track_id=1" },
      },
      {
        id: 2,
        type: "track",
        links: { artist: "/artists/1", track: "/releases/1?track_id=2" },
      },
      {
        id: 3,
        type: "track",
        links: { artist: "/artists/1", track: "/releases/1?track_id=3" },
      },
    ]);
  });

  it("returns the groups for the given query string", async () => {
    await prisma.group.createMany({ data: getFakeGroups({ length: 10 }) });

    const { getSearchResults } = searchResultController();
    const results = await getSearchResults({ query: "Group 1" });
    expect(results).toMatchObject([
      {
        id: 1,
        type: "group",
        links: { group: "/groups/1" },
      },
      {
        id: 10,
        type: "group",
        links: { group: "/groups/10" },
      },
    ]);
  });

  it("returns the collections for the given query string", async () => {
    await prisma.collection.createMany({
      data: getFakeCollections({ length: 10 }),
    });

    const { getSearchResults } = searchResultController();
    const results = await getSearchResults({ query: "Collection 1" });
    expect(results).toMatchObject([
      {
        id: 1,
        type: "collection",
        links: { collection: "/collections/1" },
      },
      {
        id: 10,
        type: "collection",
        links: { collection: "/collections/10" },
      },
    ]);
  });
});
