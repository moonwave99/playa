import prisma from "../db/prisma";
import { getFakeArtist, getFakeReleasesForArtist } from "../../test/seed";
import { searchResultController } from "./searchResult";

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
});
