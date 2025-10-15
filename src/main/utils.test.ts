import prisma from "./db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
import {
  getFolderContents,
  parsePath,
  getArtistPathFromReleaseData,
} from "./utils";
import { getFakeArtist, getFakeReleasesForArtist } from "../test/seed";
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
        path: "My Title",
        completePath: "A/Artist/[Album]/1999 - My Title",
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
      path: "My Title",
      completePath: "[V:A]/[Compilation]/1999 - My Title",
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
      path: "title",
      completePath: "A/Artist/[Album]/title",
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
              "04 - Track 4.mp3": "",
              "05 - Track 5.mp3": "",
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
          entityType: "Artist",
        },
      },
      path.join(directory, "LIBRARY_PATH")
    );

    expect(trackInfo).toEqual([
      {
        path: "01 - Track 1.mp3",
        title: "Track 1",
        trackArtist: "Artist 1",
        duration: 123,
        position: 1,
      },
      {
        path: "02 - Track 2.mp3",
        title: "Track 2",
        trackArtist: "Artist 1",
        duration: 123,
        position: 2,
      },
      {
        path: "03 - Track 3.mp3",
        title: "Track 3",
        trackArtist: "Artist 1",
        duration: 123,
        position: 3,
      },
      {
        path: "04 - Track 4.mp3",
        title: "Track 4",
        trackArtist: "Artist 1",
        duration: 123,
        position: 4,
      },
      {
        path: "05 - Track 5.mp3",
        title: "Track 5",
        trackArtist: "Artist 1",
        duration: 123,
        position: 5,
      },
    ]);
  });
});

describe("getArtistPathFromReleaseData function", () => {
  it("returns the artist path from the given release data", () => {
    {
      const releaseData = parsePath("A/Artist/[Album]/1999 - My Title");
      const artistPath = getArtistPathFromReleaseData(releaseData);
      expect(artistPath).toBe("A/Artist");
    }
    {
      const releaseData = parsePath("[V:A]/[Album]/1999 - My Title");
      const artistPath = getArtistPathFromReleaseData(releaseData);
      expect(artistPath).toBe("[V:A]");
    }
  });
});
