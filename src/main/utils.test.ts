import prisma from "./db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
import { getFolderContents, parsePath, getEntityPath } from "./utils";
import {
  getFakeArtist,
  getFakeReleasesForArtist,
  getFakeTracksForRelease,
} from "../test/seed";
import path from "path";
import { testFs } from "@moonwave99/test-fs";

afterEach(clearPrisma);

describe("parsePath function", () => {
  it("parses input correctly", () => {
    [
      "A/Artist/[Album]/1999 - My Title",
      "/A/Artist/[Album]/1999 - My Title",
      "A/Artist/[Album]/1999 - My Title/",
      "/A/Artist/[Album]/1999 - My Title/",
    ].forEach((path) => {
      const output = parsePath(path);
      expect(output).toEqual({
        title: "My Title",
        type: "Album",
        year: 1999,
        fullPath: "A/Artist/[Album]/1999 - My Title",
        artist: {
          name: "Artist",
        },
      });
    });
  });

  it("parses the V/A folder correctly", () => {
    const output = parsePath("/[V:A]/[Compilation]/1999 - My Title");
    expect(output).toEqual({
      title: "My Title",
      type: "Compilation",
      year: 1999,
      fullPath: "[V:A]/[Compilation]/1999 - My Title",
      artist: {
        name: "_VV_AA_",
      },
    });
  });

  it("returns null if path is malformed", () => {
    const output = parsePath("/A/Artist/[Album]/1999 - My Title/More/Stuff");
    expect(output).toEqual(null);
  });

  it("provides some default for unmatched titles", () => {
    const output = parsePath("/A/Artist/[Album]/title");
    expect(output).toEqual({
      title: "title",
      type: "Album",
      year: 0,
      fullPath: "A/Artist/[Album]/title",
      artist: {
        name: "Artist",
      },
    });
  });
});

describe("getFolderContents function", () => {
  it("returns the track information for the given release", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/A/Artist 1": {
          "[Album]": {
            "2000 - Release 1": {
              "01 - Track 1.mp3": "",
              "02 - Track 2.mp3": "",
              "03 - Track 3.mp3": "",
            },
          },
        },
      },
      context.task.id
    );

    await prisma.artist.create({ data: getFakeArtist(1) });
    const release = await prisma.release.create({
      data: getFakeReleasesForArtist(1).at(0),
      include: { artist: true },
    });

    const trackInfo = await getFolderContents(
      {
        ...release,
        artist: {
          ...release.artist,
          entityType: "artist",
        },
      },
      path.join(directory, "LIBRARY_PATH")
    );

    expect(trackInfo).toMatchSnapshot();
  });
});

describe("getEntityPath function", () => {
  it("returns the path for a Release", () => {
    const release = getFakeReleasesForArtist(1).at(0);
    const path = getEntityPath(release);
    expect(path).toBe("A/Artist 1/[Album]/2000 - Release 1");
  });

  it("returns the path for a Track", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const release = getFakeReleasesForArtist(1).at(0);
    const track = {
      ...getFakeTracksForRelease(1).at(0),
      release,
    };
    const path = getEntityPath(track);
    expect(path).toBe("A/Artist 1/[Album]/2000 - Release 1/01 - Track 1.mp3");
  });
});
