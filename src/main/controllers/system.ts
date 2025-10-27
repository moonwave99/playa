import prisma from "../db/prisma";
import path from "path";
import { shell, type IpcMainEvent } from "electron";
import { run } from "../run";
import { getEntityPath } from "../utils";
import { getRelease } from "../db/release";
import {
  HasEntityTypeAndId,
  ReleaseWithArtistAndSubReleases,
  ShowErrorBox,
  Track,
} from "@/types/types";
import { log } from "../logger";
import type { GetSetting } from "./settings";
import { existsSync } from "fs";

type SystemControllerParams = {
  getSetting: GetSetting;
  withPath: (key: string, folderPath: string) => string;
  showErrorBox: ShowErrorBox;
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
  showErrorBox,
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
    if (!PLAYER_PATH) {
      showErrorBox(
        "Application Error",
        "You should set the Player path in settings"
      );
      return;
    }
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
    const TAGGER_PATH = getSetting("TAGGER_PATH") as string;

    if (!TAGGER_PATH) {
      showErrorBox(
        "Application Error",
        "You should set the Tagger path in settings"
      );
      return;
    }

    const release = await prisma.release.findFirst({
      where: { id: release_id },
      include: {
        artist: true,
      },
    });
    if (!release) {
      return;
    }

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
    const file = withPath("LIBRARY_PATH", getEntityPath(release));
    if (!existsSync(file)) {
      return;
    }

    try {
      const icon =
        process.env.NODE_ENV === "TEST"
          ? path.resolve("folder.png")
          : path.join(process.resourcesPath, "folder.png");

      event.sender.startDrag({
        file,
        icon,
      });
    } catch (error) {
      log("system:drag", error);
    }
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
