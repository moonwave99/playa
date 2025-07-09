import { getFakeRelease } from "@/test/utils";
import { getFolderContents, parsePath } from "./utils";

describe("parsePath function", () => {
  it("parses input correctly", () => {
    [
      'A/Artist/[Album]/1999 - My Title',
      '/A/Artist/[Album]/1999 - My Title',
      'A/Artist/[Album]/1999 - My Title/',
      '/A/Artist/[Album]/1999 - My Title/',
    ].forEach(path => {
      const output = parsePath(path);
      expect(output).toEqual({
        title: 'My Title',
        type: 'Album',
        year: 1999,
        path: 'My Title',
        fullPath: 'A/Artist/[Album]/1999 - My Title',
        artist: {
          name: 'Artist'
        }
      });
    });
  });

  it("parses the V/A folder correctly", () => {
    const output = parsePath('/[V:A]/[Compilation]/1999 - My Title');
    expect(output).toEqual({
      title: 'My Title',
      type: 'Compilation',
      year: 1999,
      path: 'My Title',
      fullPath: '[V:A]/[Compilation]/1999 - My Title',
      artist: {
        name: '_VV_AA_'
      }
    });
  });

  it("returns null if path is malformed", () => {
    const output = parsePath('/A/Artist/[Album]/1999 - My Title/More/Stuff');
    expect(output).toEqual(null);
  });

  it('provides some default for unmatched titles', () => {
    const output = parsePath('/A/Artist/[Album]/title');
    expect(output).toEqual({
      title: 'title',
      type: 'Album',
      year: 0,
      path: 'title',
      fullPath: 'A/Artist/[Album]/title',
      artist: {
        name: 'Artist'
      }
    });
  });
});

describe('getFolderContents function', () => {
  it('returns the track information for the given release', async () => {
    const release = getFakeRelease(1);
    const trackInfo = await getFolderContents(release, 'LIBRARY_PATH');
    expect(trackInfo).toEqual([
      {
        path: '01 - track_1.mp3',
        title: 'Track 1',
        duration: 123,
        position: 1
      },
      {
        path: '02 - track_2.mp3',
        title: 'Track 2',
        duration: 123,
        position: 2
      },
      {
        path: '03 - track_3.mp3',
        title: 'Track 3',
        duration: 123,
        position: 3
      },
      {
        path: '04 - track_4.mp3',
        title: 'Track 4',
        duration: 123,
        position: 4
      },
      {
        path: '05 - track_5.mp3',
        title: 'Track 5',
        duration: 123,
        position: 5
      }
    ]);
  });
});