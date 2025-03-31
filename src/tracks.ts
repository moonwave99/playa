import prisma from "./main/db/prisma";
import type { Release, Track } from "./types/types";

async function run() {
  const releases = await prisma.release.findMany({
    select: {
      id: true,
      path: true,
      tracks: true
    },
  });

  Promise.all(releases.map((release: Release & { tracks: Track[] }) => {
    return Promise.all(release.tracks.map((track: Track) => prisma.track.update({
      where: { id: track.id },
      data: { path: track.path.replace(release.path + '/', '') }
    })));
  }))
}

run();