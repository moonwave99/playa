import prisma from "../db/prisma";
import path from "path";
import { shell, type IpcMainEvent } from "electron";
import { run } from "../run";
import { getEntityPath } from "../utils";
import { getRelease } from "../db/release";
import {
  HasEntityTypeAndId,
  ReleaseWithArtistAndSubReleases,
  Track,
} from "@/types/types";
import type { GetSetting } from "./settings";

type SystemControllerParams = {
  getSetting: GetSetting;
  withPath: (key: string, folderPath: string) => string;
};

type PlaybackParams = {
  release_id: number;
  track_id?: number;
};

type TrackWithCompleteRelease = Track & {
  release: ReleaseWithArtistAndSubReleases;
};

export function systemController({
  getSetting,
  withPath,
}: SystemControllerParams) {
  function getPaths(
    entity: ReleaseWithArtistAndSubReleases | TrackWithCompleteRelease
  ): string[] {
    if ((entity as Track).releaseId) {
      return [
        withPath(
          "LIBRARY_PATH",
          getEntityPath({ ...entity, entityType: "Track" })
        ),
      ];
    }
    return [
      entity,
      ...((entity as ReleaseWithArtistAndSubReleases).subReleases || []),
    ].map((x) =>
      withPath("LIBRARY_PATH", getEntityPath({ ...x, entityType: "Release" }))
    );
  }

  async function playback({ release_id, track_id }: PlaybackParams) {
    const PLAYER_PATH = getSetting("PLAYER_PATH") as string;

    if (track_id) {
      const track = await prisma.track.findFirst({
        where: { id: track_id },
        include: {
          release: {
            include: {
              artist: true,
              subReleases: {
                include: { artist: true },
              },
            },
          },
        },
      });
      if (!track) {
        return false;
      }

      await run("open", ["-a", PLAYER_PATH, ...getPaths(track)]);
      return true;
    }

    const release = await prisma.release.findFirst({
      where: { id: release_id },
      include: { artist: true, subReleases: { include: { artist: true } } },
    });

    if (!release) {
      return false;
    }

    await run("open", ["-a", PLAYER_PATH, ...getPaths(release)]);
    return true;
  }

  async function openTagger(release_id: number) {
    const release = await prisma.release.findFirst({
      where: { id: release_id },
      include: {
        artist: true,
      },
    });
    if (!release) {
      return;
    }
    const TAGGER_PATH = getSetting("TAGGER_PATH") as string;
    await run("open", [
      "-a",
      TAGGER_PATH,
      withPath(
        "LIBRARY_PATH",
        getEntityPath({ ...release, entityType: "Release" })
      ),
    ]);
    return true;
  }

  async function revealEntityInFinder({ entityType, id }: HasEntityTypeAndId) {
    let result;
    if (entityType === "Release") {
      result = await prisma.release.findFirst({
        where: { id },
        include: { artist: true },
      });
    } else if (entityType === "Artist") {
      result = await prisma.artist.findFirst({ where: { id } });
    } else {
      result = await prisma.track.findFirst({
        where: { id },
        include: { release: true },
      });
    }
    if (!result) {
      return;
    }
    await shell.openPath(withPath("LIBRARY_PATH", getEntityPath(result)));
    return true;
  }

  async function startDrag(id: number, event?: IpcMainEvent) {
    const release = await getRelease(id);
    if (!release) {
      return;
    }

    event.sender.startDrag({
      file: withPath("LIBRARY_PATH", getEntityPath(release)),
      icon: path.resolve("folder.png"),
    });
  }

  return {
    playback,
    openTagger,
    revealEntityInFinder,
    startDrag,
  };
}

export const actions: (keyof ReturnType<typeof systemController>)[] = [
  "playback",
  "openTagger",
  "revealEntityInFinder",
  "startDrag",
];
