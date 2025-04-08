import { getFakeArtist, withPath, getSetting, getFakeRelease, getFakeArtistByHash, getTrackFromData, getFakeTrack, getFakeReleaseByHash, send, FULL_TRACKS } from "@/test/utils";
import { dialog } from 'electron';
import path from 'path';
import prisma from '../db/__mocks__/prisma';
import fsExtra, { existsSync } from 'fs-extra';
import { releaseController } from "./release";
import { mockFs } from "@/test/mock-fs";
import { ArtistWithReleases, ReleaseType, ReleaseWithArtist, ReleaseWithArtistAndTracks } from "@/types/types";

vi.mock('../db/prisma');
vi.mock('../run');
vi.mock('../discogs');

describe('release - importFolder function', () => {
  it('returns null if the folder has no tracks', async () => {
    const { importFolder } = releaseController({ withPath, getSetting, send });
    const releases = await importFolder('empty/folder');
    expect(releases).toEqual([]);
  });

  it('returns null if the folder is malformed', async () => {
    const { importFolder } = releaseController({ withPath, getSetting, send });
    const releases = await importFolder('malformed/folder');
    expect(releases).toEqual([]);
  });

  it('parses the given path, updates the db and returns the created release', async () => {
    prisma.artist.upsert.mockImplementation(({ where }) => getFakeArtistByHash(where.hash));
    prisma.release.upsert.mockImplementation(({ where }) => getFakeRelease(where.hash));
    prisma.track.create.mockImplementation(
      ({ data }) => Promise.resolve(getTrackFromData(data))
    );
    prisma.release.update.mockImplementation(({ data, where }) => Promise.resolve({
      ...getFakeRelease(where.id),
      tracks: data.tracks.connect.map(({ id }, index) => getFakeTrack(index, id, where.id))
    }));

    const { importFolder } = releaseController({ withPath, getSetting, send });
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

    const { importFolder } = releaseController({ withPath, getSetting, send });
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

describe('release - editRelease function', () => {
  it('shows a warning if the new path already exists', async () => {
    const { editRelease } = releaseController({ withPath, getSetting, send });
    const result = await editRelease([]);
    expect(result).toEqual([]);
  });

  it('updates the release info without moving the folder if the passed path is the old one', async () => {
    const { editRelease } = releaseController({ withPath, getSetting, send });
    const spy = vi.spyOn(fsExtra, 'move');
    const release = getFakeRelease(1);

    prisma.$transaction.mockImplementation((x: unknown) => Promise.resolve(x));
    prisma.release.update.mockImplementation(({ data }) => ({ ...release, ...data }));

    const newInfo = {
      newPath: 'Album One',
      newDiscTitle: 'Album Edited',
      newTitle: 'Album Edited',
      newType: 'EP' as ReleaseType,
      newYear: 2000
    };

    const result = await editRelease([{ ...release, ...newInfo }]);

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
    const { editRelease } = releaseController({ withPath, getSetting, send });
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
    const directory = await mockFs({
      '/LIBRARY_PATH/A/Artist/[Album]/1999 - New Album Path': {}
    }, context?.task.id);

    const { editRelease } = releaseController({
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      getSetting,
      send
    });

    prisma.artist.findFirst.mockResolvedValue(
      { ...getFakeArtist(1), releases: [] } as ArtistWithReleases
    );
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
    const directory = await mockFs({
      '/LIBRARY_PATH': {}
    }, context?.task.id);

    const { editRelease } = releaseController({
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      getSetting,
      send
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
    const directory = await mockFs({
      '/LIBRARY_PATH/A/Artist/[Album]/1999 - Album One': {
        '01 - track 1.mp3': ''
      },
      '/LIBRARY_PATH/A/Artist/[EP]': {},
      '/COVERS_PATH': {
        'e6ff3253fb407e5f-cover.jpg': '',
      },
    }, context?.task.id);

    const { editRelease } = releaseController({
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      getSetting,
      send
    });

    prisma.$transaction.mockImplementation((x: unknown) => Promise.resolve(x));
    prisma.artist.findFirst.mockResolvedValue({ ...getFakeArtist(1), releases: [] } as ArtistWithReleases);
    prisma.release.update.mockImplementation(({ data }) => ({ ...release, ...data }));

    const release = getFakeRelease(1);
    const newInfo = {
      newPath: 'New Album Path',
      newDiscTitle: 'Album Edited',
      newTitle: 'Album Edited',
      newType: 'EP' as ReleaseType,
      newYear: 2000
    };

    const result = await editRelease([{ ...release, ...newInfo }]);

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
    const directory = await mockFs({
      '/LIBRARY_PATH/A/Artist/[Album]/1999 - Album One': {
        '01 - track 1.mp3': ''
      },
      '/LIBRARY_PATH/A/Artist/[EP]': {},
    }, context?.task.id);

    const { editRelease } = releaseController({
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      getSetting,
      send
    });

    prisma.$transaction.mockImplementation((x: unknown) => Promise.resolve(x));
    prisma.artist.findFirst.mockResolvedValue(
      { ...getFakeArtist(1), releases: [] } as ArtistWithReleases
    );
    prisma.release.update.mockImplementation(({ data }) => ({ ...release, ...data }));

    const release = getFakeRelease(1);
    const newInfo = {
      newPath: 'New Album Path',
      newDiscTitle: 'Album Edited',
      newTitle: 'Album Edited',
      newType: 'EP' as ReleaseType,
      newYear: 2000
    };

    const result = await editRelease([{ ...release, ...newInfo }]);

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
  });
});

describe('importCovers function', () => {
  it('searches the covers of the given releases and returns those with positive results', async () => {
    const { importCovers } = releaseController({
      withPath,
      getSetting,
      send
    });
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
    const directory = await mockFs({
      'COVERS_PATH/e6ff3253fb407e5f-cover.jpg': '',
    }, context?.task.id);

    const { importMissingCovers } = releaseController({
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      getSetting,
      send
    });
    {
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

describe('release = downloadCover function', () => {
  it('does nothing is no release if found', async () => {
    const { downloadCover } = releaseController({
      withPath,
      getSetting,
      send
    });
    prisma.release.findFirst.mockResolvedValue(null);
    const result = await downloadCover({ id: 1, url: 'https://example.com/pic.jpg' });
    expect(result).toBeFalsy();
  });

  it('downloads the passed url and stores as the cover for the given release id', async (context) => {
    const directory = await mockFs({ COVERS_PATH: {} }, context?.task.id);
    const getSetting = ((key: string) => {
      if (key === 'LIBRARY_PATH' || key === 'COVERS_PATH') {
        return path.join(directory, key);
      }
      return key;
    });
    {
      const send = vi.fn();
      const release = getFakeRelease(1);
      prisma.release.findFirst.mockResolvedValue(release);

      const { downloadCover } = releaseController({
        withPath: (key, folderPath) => path.join(directory, key, folderPath),
        getSetting,
        send
      });

      const result = await downloadCover({ id: 1, url: 'https://example.com/pic.jpg' });

      expect(result).toBeTruthy();
      expect(existsSync(
        path.join(directory, `/COVERS_PATH/${release.hash}-cover.jpg`))
      ).toBe(true);
      expect(send).toHaveBeenCalledWith(
        'coverUpdate', [release]
      );
    }
    {
      const send = vi.fn();
      const release = getFakeRelease(2);
      prisma.release.findFirst.mockResolvedValue(release);
      const { downloadCover } = releaseController({
        withPath: (key, folderPath) => path.join(directory, key, folderPath),
        getSetting,
        send
      });
      const result = await downloadCover({ id: 2, url: 'https://example.com/not-found.jpg' });
      expect(result).toBe(false);
      expect(existsSync(
        path.join(directory, `/COVERS_PATH/${release.hash}-cover.jpg`))
      ).toBe(false);
      expect(send).not.toHaveBeenCalled();
    }
  });
});

describe('refreshReleaseContents function', () => {
  it('does nothing is no release if found', async () => {
    prisma.release.findFirst.mockResolvedValue(null);
    const { refreshReleaseContents } = releaseController({ withPath, getSetting, send });
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
    const { refreshReleaseContents } = releaseController({ withPath, getSetting, send });
    const result = await refreshReleaseContents(1) as ReleaseWithArtistAndTracks[];
    expect(result[0]).toMatchObject(release);
    expect(result[0].tracks.length).toBe(5);
  });
});