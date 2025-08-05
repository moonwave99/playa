import { getFakeRelease, getFakeArtist, getSetting, withPath } from "@/test/utils";
import { shell, type IpcMainEvent } from 'electron';
import prisma from '../db/__mocks__/prisma';
import * as run from '../run';
import { systemController } from "./system";
import type { ReleaseWithArtistAndSubreleases, TrackWithRelease } from "@/types/types";

vi.mock('../db/prisma');
vi.mock('../run');

describe('system - playback function', () => {
  it('does nothing is no release if found', async () => {
    const { playback } = systemController({ getSetting, withPath });
    prisma.release.findFirst.mockResolvedValue(null);
    const result = await playback({ release_id: 1 });
    expect(result).toBeFalsy();
  });

  it('does nothing is no track if found', async () => {
    const { playback } = systemController({ getSetting, withPath });
    prisma.track.findFirst.mockResolvedValue(null);
    const result = await playback({ release_id: 1, track_id: 1 });
    expect(result).toBeFalsy();
  });

  it('calls run with the right path if the release if found', async () => {
    const { playback } = systemController({ getSetting, withPath });
    const spy = vi.spyOn(run, 'run');
    prisma.release.findFirst.mockResolvedValue(getFakeRelease(1));
    const result = await playback({ release_id: 1 });
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      'open', ['-a', 'PLAYER_PATH', 'LIBRARY_PATH/A/Artist/[Album]/1999 - Album One']
    );
  });

  it('calls run with the right paths if the release has subReleases', async () => {
    const { playback } = systemController({ getSetting, withPath });
    const spy = vi.spyOn(run, 'run');
    prisma.release.findFirst.mockResolvedValue({
      ...getFakeRelease(1),
      subReleases: [
        getFakeRelease(2)
      ]
    } as ReleaseWithArtistAndSubreleases);
    const result = await playback({ release_id: 1 });
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      'open', [
      '-a',
      'PLAYER_PATH',
      'LIBRARY_PATH/A/Artist/[Album]/1999 - Album One',
      'LIBRARY_PATH/A/Artist/[Album]/2000 - Album Two'
    ]
    );
  });

  it('calls run with the right path if the track if found', async () => {
    const { playback } = systemController({ getSetting, withPath });
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

describe('system - openTagger function', () => {
  it('does nothing is no release if found', async () => {
    const { openTagger } = systemController({ getSetting, withPath });
    prisma.release.findFirst.mockResolvedValue(null);
    const result = await openTagger(1);
    expect(result).toBeFalsy();
  });

  it('calls run with the right path if the release if found', async () => {
    const { openTagger } = systemController({ getSetting, withPath });
    const spy = vi.spyOn(run, 'run');
    prisma.release.findFirst.mockResolvedValue(getFakeRelease(1));
    const result = await openTagger(1);
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      'open', ['-a', 'TAGGER_PATH', 'LIBRARY_PATH/A/Artist/[Album]/1999 - Album One']
    );
  });
});

describe('system revealEntityInFinder function', () => {
  it('does nothing if no release is found', async () => {
    const { revealEntityInFinder } = systemController({ getSetting, withPath });
    prisma.release.findFirst.mockResolvedValue(null);
    const result = await revealEntityInFinder('release', 1);
    expect(result).toBeFalsy();
  });

  it('opens the folder in finder if release is found', async () => {
    const { revealEntityInFinder } = systemController({ getSetting, withPath });
    const spy = vi.spyOn(shell, 'openPath');
    prisma.release.findFirst.mockResolvedValue(getFakeRelease(1));
    const result = await revealEntityInFinder('release', 1);
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      'LIBRARY_PATH/A/Artist/[Album]/1999 - Album One'
    );
  });

  it('opens the folder in finder if an artist is found', async () => {
    const { revealEntityInFinder } = systemController({ getSetting, withPath });
    const spy = vi.spyOn(shell, 'openPath');
    prisma.artist.findFirst.mockResolvedValue(getFakeArtist(1));
    const result = await revealEntityInFinder('artist', 1);
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      'LIBRARY_PATH/A/Artist'
    );
  });
});

describe('system - startDrag, function', () => {
  it('should do nothing is the release is not found', async () => {
    prisma.release.findFirst.mockResolvedValue(null);
    const { startDrag } = systemController({ getSetting, withPath });
    const event = {
      sender: {
        startDrag: vi.fn()
      }
    } as unknown as IpcMainEvent;
    const spy = vi.spyOn(event.sender, 'startDrag')
    await startDrag(1, event);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should pass the dragged folder to the drag event', async () => {
    prisma.release.findFirst.mockResolvedValue(getFakeRelease(1));
    const { startDrag } = systemController({ getSetting, withPath });
    const event = {
      sender: {
        startDrag: vi.fn()
      }
    } as unknown as IpcMainEvent;
    const spy = vi.spyOn(event.sender, 'startDrag')
    await startDrag(1, event);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      file: 'LIBRARY_PATH/A/Artist/[Album]/1999 - Album One'
    }));
  });
});