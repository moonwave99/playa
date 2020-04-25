import { argv } from 'yargs';
import { initDBs } from '../src/main/lib/database';

const path = argv.path as string
  || `${process.env.HOME}/Library/Application\ Support/Playa/databases/`;

const db = initDBs({
  path
});

// this is just an example scripting playground
(async () => {
  const results = await db.track.find({ _id: '/Volumes/Public/Music/D/Dido/[Album]/1999 - No Angel/01 - Here With Me.mp3'});
  console.log(results);
})();
