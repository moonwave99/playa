import prisma from "../db/prisma";
import { getFakeArtist, getFakeReleasesForArtist } from "@/test/seed";
import { VARIOUS_ARTISTS_NAME } from "@/constants";
import path from "node:path";
import {
  searchCover,
  normalizeTitle,
  normalizeArtist,
  updateCoverInfo,
} from ".";

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
      if (dest.includes("7bc1dbae1f10a59c")) {
        return dest;
      }
      throw new Error();
    },
  },
}));

vi.mock("node-vibrant/node", () => ({
  Vibrant: {
    from: (imagePath: string) => {
      return {
        getPalette: () => {
          return {
            Vibrant: {
              hex: imagePath.includes("dark") ? "#000000" : "#FFFFFF",
            },
          };
        },
      };
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
    expect(normalizeArtist(VARIOUS_ARTISTS_NAME)).toBe("Various");
  });
});

describe("updateCoverInfo function", () => {
  it("updates the cover info for a dark image", async () => {
    await prisma.release.create({ data: getFakeReleasesForArtist(1).at(0) });
    await updateCoverInfo(1, "/path/to/dark-image.jpg");
    const release = await prisma.release.findFirst({ where: { id: 1 } });
    expect(release.colorInfo).toEqual({ color: "#000000", darkText: false });
  });

  it("updates the cover info for a dark image", async () => {
    await prisma.release.create({ data: getFakeReleasesForArtist(1).at(0) });
    await updateCoverInfo(1, "/path/to/light-image.jpg");
    const release = await prisma.release.findFirst({ where: { id: 1 } });
    expect(release.colorInfo).toEqual({ color: "#FFFFFF", darkText: true });
  });
});
