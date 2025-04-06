import { describe, it, expect, TestContext } from "vitest";
import {
  getFakeRelease,
  getFakeArtist,
  getTrackFromData,
  getFakeTrack,
  getFakeArtistByHash,
  getFakeReleaseByHash,
  FULL_TRACKS
} from "@/test/utils";

import prisma from './db/__mocks__/prisma';
import * as run from './run';
import * as state from './state';
import { shell, dialog, type IpcMainEvent } from 'electron';
import { existsSync } from 'fs';
import fsExtra from "fs-extra";
import path from 'path';
import { mockFs, mockFsCleanup } from "@/test/mock-fs";
import type { Tree } from "@/test/mock-fs";

import {
  parsePath,
  openTagger,
  playback,
  revealEntityInFinder,
  withLibraryPath,
  withCoversPath,
  getFolderContents,
  importFolder,
  importCovers,
  importMissingCovers,
  downloadCover,
  refreshReleaseContents,
  editRelease,
  editArtist,
  startDrag
} from "./system";

import type {
  ArtistWithReleases,
  ReleaseType,
  ReleaseWithArtist,
  ReleaseWithArtistAndTracks,
  TrackWithRelease
} from "@/types/types";

vi.mock('./db/prisma');
vi.mock('./run');
vi.mock('./state', () => {
  return {
    getStateManager: vi.fn(),
    send: vi.fn()
  }
});
vi.mock('./discogs');

const mocks = vi.hoisted(() => {
  return {
    getSetting: vi.fn(),
  };
});

vi.mock('./settings', () => {
  return {
    getSetting: mocks.getSetting
  };
});

beforeAll(async () => {
  await mockSettings();
});

beforeEach(async (context: TestContext) => {
  await mockFsCleanup(context.task.id);
});

afterAll(() => {
  mockFsCleanup();
});

type MockSettingsParams = {
  tree: Tree;
  context?: TestContext;
};

async function mockSettings(params?: MockSettingsParams) {
  const { tree, context } = params || { tree: {} };
  const directory = await mockFs(tree, context?.task.id);
  mocks.getSetting.mockImplementation((key) => {
    if (key === 'LIBRARY_PATH' || key === 'COVERS_PATH') {
      return path.join(directory, key);
    }
    return key;
  });
  return { directory };
}

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

describe('playback function', () => {
  it('does nothing is no release if found', async () => {
    prisma.release.findFirst.mockResolvedValue(null);
    const result = await playback({ release_id: 1 });
    expect(result).toBeFalsy();
  });

  it('does nothing is no track if found', async () => {
    prisma.track.findFirst.mockResolvedValue(null);
    const result = await playback({ release_id: 1, track_id: 1 });
    expect(result).toBeFalsy();
  });

  it('calls run with the right path if the release if found', async () => {
    const spy = vi.spyOn(run, 'run');
    prisma.release.findFirst.mockResolvedValue(getFakeRelease(1));
    const result = await playback({ release_id: 1 });
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      'open', ['-a', 'PLAYER_PATH', 'LIBRARY_PATH/A/Artist/[Album]/1999 - Album One']
    );
  });

  it('calls run with the right path if the track if found', async () => {
    const spy = vi.spyOn(run, 'run');
    prisma.release.findFirst.mockResolvedValue(getFakeRelease(1));
    prisma.track.findFirst.mockResolvedValue({
      id: 11,
      path: '01 - title.mp3',
      releaseId: 1,
      release: getFakeRelease(1)
    } as TrackWithRelease);
    const result = await playback({ release_id: 1, track_id: 1 });
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      'open', ['-a', 'PLAYER_PATH', 'LIBRARY_PATH/A/Artist/[Album]/1999 - Album One/01 - title.mp3']
    );
  });
});

describe('openTagger function', () => {
  it('does nothing is no release if found', async () => {
    prisma.release.findFirst.mockResolvedValue(null);
    const result = await openTagger(1);
    expect(result).toBeFalsy();
  });

  it('calls run with the right path if the release if found', async () => {
    const spy = vi.spyOn(run, 'run');
    prisma.release.findFirst.mockResolvedValue(getFakeRelease(1));
    const result = await openTagger(1);
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      'open', ['-a', 'TAGGER_PATH', 'LIBRARY_PATH/A/Artist/[Album]/1999 - Album One']
    );
  });
});

describe('revealEntityInFinder function', () => {
  it('does nothing if no release is found', async () => {
    prisma.release.findFirst.mockResolvedValue(null);
    const result = await revealEntityInFinder('release', 1);
    expect(result).toBeFalsy();
  });

  it('opens the folder in finder if release is found', async () => {
    const spy = vi.spyOn(shell, 'openPath');
    prisma.release.findFirst.mockResolvedValue(getFakeRelease(1));
    const result = await revealEntityInFinder('release', 1);
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      'LIBRARY_PATH/A/Artist/[Album]/1999 - Album One'
    );
  });

  it('opens the folder in finder if an artist is found', async () => {
    const spy = vi.spyOn(shell, 'openPath');
    prisma.artist.findFirst.mockResolvedValue(getFakeArtist(1));
    const result = await revealEntityInFinder('artist', 1);
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      'LIBRARY_PATH/A/Artist'
    );
  });
});

describe('withLibraryPath function', () => {
  it('prepends the library path to the given path', () => {
    expect(withLibraryPath('path/to/folder')).toBe('LIBRARY_PATH/path/to/folder');
  });
});

describe('withCoversPath function', () => {
  it('prepends the covers path to the given path', () => {
    expect(withCoversPath('path/to/folder')).toBe('COVERS_PATH/path/to/folder');
  });
});

describe('getFolderContents function', () => {
  it('returns the track information for the given release', async () => {
    const release = getFakeRelease(1);
    const trackInfo = await getFolderContents(release);
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

describe('importFolder function', () => {
  it('returns null if the folder has no tracks', async () => {
    const releases = await importFolder('empty/folder');
    expect(releases).toEqual([]);
  });

  it('returns null if the folder is malformed', async () => {
    const releases = await importFolder('malformed/folder');
    expect(releases).toEqual([]);
  });

  it('parses the given path, updates the db and returns the created release', async () => {
    prisma.artist.upsert.mockImplementation(({ where }) => getFakeArtistByHash(where.hash));
    prisma.release.upsert.mockImplementation(({ where }) => getFakeRelease(where.hash));
    prisma.track.create.mockImplementation(
      ({ data }) => Promise.resolve(getTrackFromData(data))
    );
    prisma.release.update.mockImplementation(({ data, where }) => {
      return Promise.resolve({
        ...getFakeRelease(where.id),
        tracks: data.tracks.connect.map(({ id }, index) => getFakeTrack(index, id, where.id))
      })
    })
    const releases = await importFolder('A/Artist/[Album]/1999 - Single Folder');
    expect(releases.length).toBe(1);
    expect(releases[0].tracks.length).toBe(5);
  });


  it('parses the given path, updates the db and returns the created releases', async () => {
    prisma.artist.upsert.mockImplementation(({ where }) => getFakeArtistByHash(where.hash));
    prisma.release.upsert.mockImplementation(({ where }) => getFakeReleaseByHash(where.hash));
    prisma.track.create.mockImplementation(
      ({ data }) => Promise.resolve(getTrackFromData(data))
    );
    prisma.release.update.mockImplementation(({ data, where }) => {
      return Promise.resolve({
        ...getFakeRelease(where.id),
        tracks: data.tracks.connect.map(({ id }, index) => getFakeTrack(index, id, where.id))
      })
    })
    const releases = await importFolder('A/Artist/[Album]');

    expect(releases.length).toBe(2);
    expect(releases[0]).toMatchObject({
      _type: 'release',
      id: 2,
      path: 'Album Two',
      title: 'Album Two',
      hash: 'b66649708b05af8e',
      year: 2000,
      type: 'Album',
      artist_id: 1,
    });
    expect(releases[1]).toMatchObject({
      _type: 'release',
      id: 1,
      path: 'Album One',
      title: 'Album One',
      hash: 'e6ff3253fb407e5f',
      year: 1999,
      type: 'Album',
      artist_id: 1,
    });
    expect(releases[0].tracks.length).toBe(5);
    expect(releases[1].tracks.length).toBe(5);
  });
});

describe('importCovers function', () => {
  it('searches the covers of the given releases and returns those with positive results', async () => {
    {
      const results = await importCovers([getFakeRelease(1)]);
      expect(results[0]).toMatchObject({ id: 1 });
    }
    {
      const results = await importCovers([getFakeRelease(3)]);
      expect(results.length).toBe(0);
    }
  });
});

describe('importMissingCovers function', () => {
  it('imports the covers of the releases without an existing cover file', async (context) => {
    {
      await mockSettings({
        context,
        tree: {
          '/COVERS_PATH': {
            'e6ff3253fb407e5f-cover.jpg': '',
          },
        }
      });
      const releases = [getFakeRelease(1)];
      const updatedReleases = await importMissingCovers(releases);
      expect(updatedReleases.length).toBe(0);
    }
    {
      const releases = [
        getFakeRelease(1),
        getFakeRelease(2),
      ];
      const updatedReleases = await importMissingCovers(releases);
      expect(updatedReleases.length).toBe(1);
      expect(updatedReleases[0]).toMatchObject({ id: 2 });
    }
  });
});

describe('downloadCover function', () => {
  it('does nothing is no release if found', async () => {
    prisma.release.findFirst.mockResolvedValue(null);
    const result = await downloadCover({ id: 1, url: 'https://example.com/pic.jpg' });
    expect(result).toBeFalsy();
  });
  it('downloads the passed url and stores as the cover for the given release id', async (context) => {
    {
      const { directory } = await mockSettings({
        context, tree: {
          COVERS_PATH: {}
        }
      });
      const spy = vi.spyOn(state, 'send');
      const release = getFakeRelease(1);
      prisma.release.findFirst.mockResolvedValue(release);

      const result = await downloadCover({ id: 1, url: 'https://example.com/pic.jpg' });

      expect(result).toBeTruthy();
      expect(existsSync(
        path.join(directory, `/COVERS_PATH/${release.hash}-cover.jpg`))
      ).toBe(true);
      expect(spy).toHaveBeenCalledWith(
        'coverUpdate', [release]
      );
    }
    {
      const spy = vi.spyOn(state, 'send');
      const release = getFakeRelease(2);
      prisma.release.findFirst.mockResolvedValue(release);
      const result = await downloadCover({ id: 2, url: 'https://example.com/not-found.jpg' });
      expect(result).toBe(false);
      expect(existsSync(`/COVERS_PATH/${release.hash}-cover.jpg`)).toBe(false);
      expect(spy).not.toHaveBeenCalled();
    }
  });
})

describe('refreshReleaseContents function', () => {
  it('does nothing is no release if found', async () => {
    prisma.release.findFirst.mockResolvedValue(null);
    const result = await refreshReleaseContents(1);
    expect(result).toBeFalsy();
  });

  it('updates the track information for the given release and returns it', async () => {
    const release = { ...getFakeRelease(1), subReleases: [] as ReleaseWithArtist[] };
    prisma.release.findFirst.mockResolvedValue(release);
    prisma.track.create.mockImplementation(
      ({ data }) => Promise.resolve(getTrackFromData(data))
    );
    prisma.release.update.mockResolvedValue({
      ...release,
      tracks: FULL_TRACKS
    } as ReleaseWithArtistAndTracks);
    const result = await refreshReleaseContents(1) as ReleaseWithArtistAndTracks[];
    expect(result[0]).toMatchObject(release);
    expect(result[0].tracks.length).toBe(5);
  });
});

describe('startDrag, function', () => {
  it('should pass the dragged folder to the drag event', async () => {
    await mockSettings();
    const event = {
      sender: {
        startDrag: vi.fn()
      }
    } as unknown as IpcMainEvent;
    const spy = vi.spyOn(event.sender, 'startDrag')
    startDrag('path/to/folder', event);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      file: 'LIBRARY_PATH/path/to/folder'
    }));
  });
});

describe('editRelease function', () => {
  it('returns early if no info is provided', async () => {
    const result = await editRelease([]);
    expect(result).toEqual([]);
  });

  it('updates the release info without moving the folder if the passed path is the old one', async () => {
    const spy = vi.spyOn(fsExtra, 'move');
    const release = getFakeRelease(1);

    prisma.$transaction.mockImplementation((x: unknown) => Promise.resolve(x));
    prisma.release.update.mockImplementation(({ data }) => {
      return {
        ...release,
        ...data
      };
    });

    const newInfo = {
      newPath: 'Album One',
      newDiscTitle: 'Album Edited',
      newTitle: 'Album Edited',
      newType: 'EP' as ReleaseType,
      newYear: 2000
    };

    const result = await editRelease([{
      ...release,
      ...newInfo
    }]);

    expect(result[0]).toMatchObject({
      path: 'Album One',
      discTitle: null,
      title: 'Album Edited',
      type: 'EP' as ReleaseType,
      year: 2000
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it('shows a warning if the new path contains any ../ sequence', async () => {
    const moveSpy = vi.spyOn(fsExtra, 'move');
    const dialogSpy = vi.spyOn(dialog, 'showMessageBoxSync');
    const release = getFakeRelease(1);
    const newInfo = {
      newPath: '../Album One',
      newDiscTitle: 'Album Edited',
      newTitle: 'Album Edited',
      newType: 'EP' as ReleaseType,
      newYear: 2000
    };

    const result = await editRelease([{
      ...release,
      ...newInfo
    }]);

    expect(dialogSpy).toHaveBeenCalledWith(
      null, {
      message: 'Error while renaming',
      detail: "Path cannot contain any '../' sequence",
      type: 'error',
      buttons: ['OK'],
    });

    expect(result).toBe(false);
    expect(moveSpy).not.toHaveBeenCalled();
  });

  it('shows a warning if the new path exists', async (context) => {
    await mockSettings({
      context,
      tree: {
        '/LIBRARY_PATH/A/Artist/[Album]/1999 - New Album Path': {}
      }
    });

    prisma.artist.findFirst.mockResolvedValue({ ...getFakeArtist(1), releases: [] } as ArtistWithReleases);
    const moveSpy = vi.spyOn(fsExtra, 'move');
    const dialogSpy = vi.spyOn(dialog, 'showMessageBoxSync');
    const release = getFakeRelease(1);
    const newInfo = {
      newPath: 'New Album Path',
      newDiscTitle: 'Album Edited',
      newTitle: 'Album Edited',
      newType: 'EP' as ReleaseType,
      newYear: 2000
    };

    const result = await editRelease([{
      ...release,
      ...newInfo
    }]);

    expect(dialogSpy).toHaveBeenCalledWith(
      null, {
      message: 'Error while renaming',
      detail: `Path ${newInfo.newPath} already exists`,
      type: 'error',
      buttons: ['OK'],
    });

    expect(result).toBe(false);
    expect(moveSpy).not.toHaveBeenCalled();
  });

  it('shows a warning if the old path does not exist', async (context) => {
    const { directory } = await mockSettings({
      context,
      tree: {
        '/LIBRARY_PATH': {}
      }
    });
    prisma.artist.findFirst.mockResolvedValue({ ...getFakeArtist(1), releases: [] } as ArtistWithReleases);
    const dialogSpy = vi.spyOn(dialog, 'showMessageBoxSync');
    const release = {
      ...getFakeRelease(1),
      path: 'not-existing'
    };
    const newInfo = {
      newPath: 'New Album Path',
      newDiscTitle: 'Album Edited',
      newTitle: 'Album Edited',
      newType: 'EP' as ReleaseType,
      newYear: 2000
    };

    const result = await editRelease([{
      ...release,
      ...newInfo
    }]);

    expect(dialogSpy).toHaveBeenCalledWith(
      null, {
      message: 'Error while renaming',
      type: 'warning',
      detail: `Release 1 not found at: ${directory}/LIBRARY_PATH/A/Artist/[Album]/1999 - not-existing`,
      buttons: ['OK'],
    });

    expect(result).toBe(false);
  });

  it('should move the release files and update it accordingly', async (context) => {
    const { directory } = await mockSettings({
      context,
      tree: {
        '/LIBRARY_PATH/A/Artist/[Album]/1999 - Album One': {
          '01 - track 1.mp3': ''
        },
        '/LIBRARY_PATH/A/Artist/[EP]': {},
        '/COVERS_PATH': {
          'e6ff3253fb407e5f-cover.jpg': '',
        },
      }
    });

    prisma.$transaction.mockImplementation((x: unknown) => Promise.resolve(x));
    prisma.artist.findFirst.mockResolvedValue({ ...getFakeArtist(1), releases: [] } as ArtistWithReleases);
    prisma.release.update.mockImplementation(({ data }) => {
      return {
        ...release,
        ...data
      }
    });

    const release = getFakeRelease(1);
    const newInfo = {
      newPath: 'New Album Path',
      newDiscTitle: 'Album Edited',
      newTitle: 'Album Edited',
      newType: 'EP' as ReleaseType,
      newYear: 2000
    };

    const result = await editRelease([{
      ...release,
      ...newInfo
    }]);

    expect(result[0]).toMatchObject({
      path: 'New Album Path',
      discTitle: null,
      title: 'Album Edited',
      type: 'EP' as ReleaseType,
      year: 2000
    });

    expect(existsSync(
      path.join(directory, 'LIBRARY_PATH/A/Artist/[Album]/1999 - Album One'))
    ).toBe(false);
    expect(existsSync(
      path.join(directory, 'LIBRARY_PATH/A/Artist/[EP]/2000 - New Album Path'))
    ).toBe(true);
    expect(existsSync(
      path.join(directory, 'COVERS_PATH/e6ff3253fb407e5f-cover.jpg'))
    ).toBe(false);
    expect(existsSync(
      path.join(directory, 'COVERS_PATH/a916d4005e922133-cover.jpg'))
    ).toBe(true);
  });

  it('should skip moving the current cover if it does not exist', async (context) => {
    const { directory } = await mockSettings({
      context,
      tree: {
        '/LIBRARY_PATH/A/Artist/[Album]/1999 - Album One': {
          '01 - track 1.mp3': ''
        },
        '/LIBRARY_PATH/A/Artist/[EP]': {},
      }
    });

    prisma.$transaction.mockImplementation((x: unknown) => Promise.resolve(x));
    prisma.artist.findFirst.mockResolvedValue({ ...getFakeArtist(1), releases: [] } as ArtistWithReleases);
    prisma.release.update.mockImplementation(({ data }) => {
      return {
        ...release,
        ...data
      }
    });

    const release = getFakeRelease(1);
    const newInfo = {
      newPath: 'New Album Path',
      newDiscTitle: 'Album Edited',
      newTitle: 'Album Edited',
      newType: 'EP' as ReleaseType,
      newYear: 2000
    };

    const result = await editRelease([{
      ...release,
      ...newInfo
    }]);

    expect(result[0]).toMatchObject({
      path: 'New Album Path',
      discTitle: null,
      title: 'Album Edited',
      type: 'EP' as ReleaseType,
      year: 2000
    });

    expect(existsSync(
      path.join(directory, 'COVERS_PATH/a916d4005e922133-cover.jpg'))
    ).toBe(false);
  })
});

describe('editArtist', () => {
  it('shows a warning if the new path already exists', async (context) => {
    await mockSettings({
      context,
      tree: {
        '/LIBRARY_PATH/A/Artist New': {}
      }
    });
    const moveSpy = vi.spyOn(fsExtra, 'move');
    const dialogSpy = vi.spyOn(dialog, 'showMessageBoxSync');

    const artist = getFakeArtist(1);

    const result = await editArtist({
      ...artist,
      newName: 'Artist New',
      newPath: 'A/Artist New',
    });

    expect(dialogSpy).toHaveBeenCalledWith(
      null, {
      message: 'Error while renaming',
      detail: `Path A/Artist New already exists`,
      type: 'error',
      buttons: ['OK'],
    });

    expect(result).toBe(false);
    expect(moveSpy).not.toHaveBeenCalled();
  });

  it('updates the artist with the given information', async (context) => {
    const { directory } = await mockSettings({
      context,
      tree: {
        '/LIBRARY_PATH/A/Artist': {}
      }
    });

    const artist = getFakeArtist(1);

    const result = await editArtist({
      ...artist,
      newName: 'Artist New',
      newPath: 'A/Artist New',
    });

    expect(result).toBeTruthy();

    expect(existsSync(
      path.join(directory, 'LIBRARY_PATH/A/Artist'))
    ).toBe(false);
    expect(existsSync(
      path.join(directory, 'LIBRARY_PATH/A/Artist New'))
    ).toBe(true);
  });
});