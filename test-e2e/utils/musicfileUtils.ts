import * as Path from 'path';
import * as fs from 'fs-extra';
import ID3Writer from 'browser-id3-writer';

const SPECTRON_BASEPATH = Path.join(process.cwd(), '.spectron');
const MUSIC_PATH = Path.join(SPECTRON_BASEPATH, 'music');

const DEFAULT_MP3_FILE = Path.join(__dirname, 'default.mp3');

type TestAlbum = {
  artist: string;
  title: string;
  year: number;
  tracks: string[];
}

type GenerateTrackParams = {
  artist: string;
  title: string;
  album: string;
  year: number;
  number: number;
}

export const TestAlbums: TestAlbum[] = [
  {
    artist: 'Slowdive',
    title: 'Just for a day',
    year: 1991,
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

export async function generateAlbum(album: TestAlbum): Promise<string[]> {
  await prepareDir();
  const { artist, year, title } = album;
  return Promise.all(
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
}
