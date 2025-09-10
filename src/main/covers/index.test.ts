import { getFakeArtist, getFakeReleasesForArtist } from "@/test/seed";
import path from "node:path";
import { searchCover, normalizeTitle, normalizeArtist } from ".";

const spyFetch = vi.spyOn(globalThis, "fetch");

beforeEach(() => {
  spyFetch.mockReset();
});

afterAll(() => {
  spyFetch.mockRestore();
});

vi.mock("image-downloader", () => ({
  default: {
    image: ({ dest }: { dest: string }) => {
      if (dest.includes("ee1478c38c24f36e")) {
        return dest;
      }
      throw new Error();
    },
  },
}));

const discogsSecrets = {
  DISCOGS_KEY: "DISCOGS_KEY",
  DISCOGS_SECRET: "DISCOGS_SECRET",
};

const outputPath = "path/to/output";

describe("searchCover function", async () => {
  const artist = getFakeArtist(1);
  const releases = getFakeReleasesForArtist(1, 3);

  it("searches for release cover", async () => {
    spyFetch.mockImplementation(async (url: string) => {
      if (url.includes("deezer")) {
        return new Response(JSON.stringify({ data: [] }));
      }
      return new Response(
        JSON.stringify({
          results: [
            {
              cover_image: "https://path/to/image.jpg",
            },
          ],
        })
      );
    });

    const result = await searchCover(
      { release: releases[0], artist, outputPath },
      discogsSecrets
    );

    expect(result).toBe(path.join(outputPath, `${releases[0].hash}-cover.jpg`));
  });

  it("returns false if no results are found", async () => {
    const result = await searchCover(
      { release: releases[2], artist, outputPath },
      discogsSecrets
    );

    expect(result).toBe(false);
  });

  it("returns false if download fails", async () => {
    const result = await searchCover(
      { release: releases[1], artist, outputPath },
      discogsSecrets
    );

    expect(result).toBe(false);
  });
});

describe("normalizeTitle function", () => {
  it("replaces special characters", () => {
    expect(normalizeTitle("Black : White! (w: Artist 2) CD1")).toBe(
      "Black / White"
    );
  });
});

describe("normalizeArtist function", () => {
  it("replaces special characters", () => {
    expect(normalizeArtist("Malaria!")).toBe("Malaria");
  });
  it("replaces the various artist name", () => {
    expect(normalizeArtist("_VV_AA_")).toBe("Various");
  });
});
