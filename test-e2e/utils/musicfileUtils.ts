import * as Path from 'path';
import * as fs from 'fs-extra';
import ID3Writer from 'browser-id3-writer';
import { SPECTRON_BASEPATH } from './appUtils'
import { TestTrack } from './databaseUtils';

const MUSIC_PATH = Path.join(SPECTRON_BASEPATH, 'music');

const DEFAULT_MP3_FILE = Path.join(__dirname, '_default.mp3');
const DEFAULT_TRACK_DURATION = 15;

type FileAlbum = {
  artist: string;
  title: string;
  year: number;
  type: string,
  tracks: string[];
}

type GenerateTrackParams = {
  artist: string;
  title: string;
  album: string;
  year: number;
  number: number;
}

export const FileAlbums: FileAlbum[] = [
  {
    artist: 'Slowdive',
    title: 'Just for a day',
    year: 1991,
    type: 'album',
    tracks: [
      "Spanish Air",
      "Celia's Dream",
      "Catch the Breeze",
      "Ballad of Sister Sue",
      "Erik's Song",
      "Waves",
      "Brighter",
      "The Sadman",
      "Primal"
    ]
  },
  {
    artist: 'My Bloody Valentine',
    title: 'Loveless',
    year: 1991,
    type: 'album',
    tracks: [
      'Only Shallow',
      'Loomer',
      'Touched',
      'To Here Knows When',
      'When You Sleep',
      'I Only Said',
      'Come In Alone',
      'Sometimes',
      'Blown a Wish',
      'What You Want',
      'Soon'
    ]
  }
];

async function prepareDir(): Promise<void> {
  await fs.remove(MUSIC_PATH);
  await fs.ensureDir(MUSIC_PATH);
}

async function generateTrack({
  artist,
  title,
  album,
  year,
  number
}: GenerateTrackParams): Promise<string> {
  const destPath = Path.join(
    MUSIC_PATH,
    album,
    `${number < 10 ? `0${number}` : number} - ${title}.mp3`
  );

  const songBuffer = await fs.readFile(DEFAULT_MP3_FILE);
  const writer = new ID3Writer(songBuffer);

  writer
    .setFrame('TIT2', title)
    .setFrame('TPE1', [artist])
    .setFrame('TALB', album)
    .setFrame('TYER', year)
    .setFrame('TRCK', number);
  writer.addTag();

  const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
  await fs.ensureDir(Path.join(MUSIC_PATH, album));
  await fs.writeFile(destPath, taggedSongBuffer);
  return Promise.resolve(destPath);
}

type GeneratedAlbumInfo = {
  path: string;
  tracks: TestTrack[];
}

export async function generateAlbum(album: FileAlbum): Promise<GeneratedAlbumInfo> {
  await prepareDir();
  const { artist, year, title } = album;
  const tracks = await Promise.all(
    album.tracks.map((track, index) =>
      generateTrack({
        artist,
        year,
        title: track,
        album: title,
        number: index + 1
      })
    )
  );
  return {
    path: Path.join(MUSIC_PATH, title),
    tracks: album.tracks.map((track, index) => ({
      _id: tracks[index],
      _rev: null,
      path: tracks[index],
      found: true,
      artist,
      year,
      title: track,
      album: title,
      number: index + 1,
      duration: DEFAULT_TRACK_DURATION
    }))
  };
}
