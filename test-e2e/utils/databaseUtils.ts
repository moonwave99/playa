import * as Path from 'path';
import * as fs from 'fs-extra';
import Database from '../../src/main/lib/database';

const SPECTRON_BASEPATH = Path.join(process.cwd(), '.spectron');
const DB_PATH = Path.join(SPECTRON_BASEPATH, 'databases');

async function prepareDir(): Promise<void> {
  await fs.ensureDir(DB_PATH);
  await fs.ensureDir(DB_PATH);
}

export async function populateTestDB(): Promise<void> {
  await prepareDir();
  const entities = ['playlist', 'album', 'track'];

  const db: { [key: string]: Database }
    = entities.reduce((memo, key) =>
      ({ ...memo, [key]: new Database({ path: DB_PATH + Path.sep, name: key })})
    , {});

  const now = new Date().toISOString();
  await db.playlist.save({
    _id: '1',
    _rev: null,
    title: 'New Playlist 1',
    created: now,
    accessed: now,
    albums: [] as string[]
  });

  await db.playlist.close();
  await db.album.close();
  await db.track.close();
}
