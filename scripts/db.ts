import { argv } from 'yargs';
import { initDBs } from '../src/main/lib/database';

const path = argv.path as string
  || `${process.env.HOME}/Library/Application\ Support/Playa/databases/`;

const db = initDBs({
  path
});

// this is just an example scripting playground
(async () => {
  const results = await db.album.groupCount('year');
  console.log(results);
})();
