import prisma from "../db/prisma";
import path from 'path';
import { shell, type IpcMainEvent } from 'electron';
import { getSetting } from '../settings';
import { run } from '../run';
import { getEntityPath } from "../utils";
import { getRelease } from "../db/release";

type SystemControllerParams = {
  getSetting: (key: string) => ReturnType<typeof getSetting>;
  withPath: (key: string, folderPath: string) => string;
};

type PlaybackParams = {
  release_id: number;
  track_id?: number;
};

export function systemController({ getSetting, withPath }: SystemControllerParams) {

  async function playback({ release_id, track_id }: PlaybackParams) {
    const PLAYER_PATH = getSetting('PLAYER_PATH') as string;
    if (track_id) {
      const track = await prisma.track.findFirst({
        where: { id: track_id },
        include: {
          release: {
            include: { artist: true }
          }
        }
      });
      if (!track) {
        return false;
      }
      await run('open', ['-a', PLAYER_PATH,
        withPath('LIBRARY_PATH', getEntityPath({ ...track, _type: 'track' }))
      ]);
      return true;
    }

    const release = await prisma.release.findFirst({
      where: { id: release_id },
      include: { artist: true, subReleases: { include: { artist: true } } },
    });

    if (!release) {
      return false;
    }

    await run('open', ['-a', PLAYER_PATH,
      ...[
        release,
        ...(release.subReleases || [])
      ].map(x => withPath('LIBRARY_PATH', getEntityPath({ ...x, _type: 'release' })))
    ]);
    return true;
  }

  async function openTagger(release_id: number) {
    const release = await prisma.release.findFirst({
      where: { id: release_id },
      include: {
        artist: true
      },
    });
    if (!release) {
      return;
    }
    const TAGGER_PATH = getSetting('TAGGER_PATH') as string;
    await run('open', ['-a', TAGGER_PATH,
      withPath('LIBRARY_PATH', getEntityPath({ ...release, _type: 'release' }))
    ]);
    return true;
  }

  async function revealEntityInFinder(entity: 'release' | 'artist', id: number) {
    let result;
    if (entity === 'release') {
      result = await prisma.release.findFirst({ where: { id }, include: { artist: true } });
    } else {
      result = await prisma.artist.findFirst({ where: { id } });
    }
    if (!result) {
      return;
    }
    await shell.openPath(
      withPath('LIBRARY_PATH', getEntityPath({ ...result, _type: entity }))
    );
    return true;
  }

  async function startDrag(id: number, event?: IpcMainEvent) {
    const release = await getRelease(id);
    if (!release) {
      return;
    }

    event.sender.startDrag({
      file: withPath('LIBRARY_PATH', getEntityPath(release)),
      icon: path.resolve('folder.png')
    });
  }

  return {
    playback,
    openTagger,
    revealEntityInFinder,
    startDrag
  };
}

export const actions = [
  'playback',
  'openTagger',
  'revealEntityInFinder',
  'startDrag'
];