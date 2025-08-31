/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable  @typescript-eslint/no-explicit-any */
import path from "path";
import { outputJSON, readJSON, remove } from "fs-extra";
import { globby } from "globby";
import { zip } from "zip-a-folder";
import { Open } from "unzipper";
import prisma from "./prisma";
import { log } from "../logger";

type ExportDataParams = {
  outputPath: string;
  userDataPath: string;
  appVersion: string;
};

export async function exportData({
  outputPath,
  userDataPath,
  appVersion,
}: ExportDataParams) {
  const exportName = `playa-data-${new Date().toISOString().replaceAll(":", "-")}`;
  const tempPath = path.join(userDataPath, exportName);
  const info = {
    appVersion,
  };

  await Promise.all(
    ["artist", "release", "track", "collection", "group"].map((table) =>
      dumpTable(table, tempPath)
    )
  );
  await outputJSON(path.join(tempPath, `_info.json`), info, {
    spaces: 2,
  });
  try {
    await zip(tempPath, path.join(outputPath, `${exportName}.zip`));
  } catch (error) {
    log("importExport:exportData", "Error zipping", error);
  }
  await remove(tempPath);
}

const includeMap: Record<string, object> = {
  release: {
    subReleases: { select: { id: true } },
    collections: { select: { id: true } },
    coverCollections: { select: { id: true } },
  },
  artist: {
    appearsIn: { select: { id: true } },
    groups: { select: { id: true } },
    relatedArtists: { select: { id: true } },
    coverGroups: { select: { id: true } },
  },
};

async function dumpTable(table: string, outputPath: string) {
  const include = includeMap[table] || {};
  const data = await (prisma as any)[table].findMany({ include });
  await outputJSON(path.join(outputPath, `${table}s.json`), data, {
    spaces: 2,
  });
}

type ImportDataParams = {
  inputPath: string;
  userDataPath: string;
  appVersion: string;
  onProgress: (step: string, completed?: boolean) => void;
};

export async function importData({
  inputPath,
  userDataPath,
  appVersion,
  onProgress,
}: ImportDataParams) {
  const ext = path.extname(inputPath);
  if (ext !== ".zip") {
    throw new Error("Import file must be in .zip format");
  }

  const fileName = path.basename(inputPath, ext);
  const tempPath = path.join(userDataPath, "imports", fileName);

  const directory = await Open.file(inputPath);
  await directory.extract({ path: tempPath });

  const files = await globby("*.json", {
    cwd: tempPath,
  });

  if (
    files.map((x) => path.basename(x, ".json")).join("-") !==
    ["_info", "artists", "collections", "groups", "releases", "tracks"].join(
      "-"
    )
  ) {
    throw new Error("Wrong import format");
  }

  const info = await readJSON(path.join(tempPath, "_info.json"));

  if (info.appVersion !== appVersion) {
    throw new Error("Import file generated from a different app version");
  }

  const artists = await readJSON(path.join(tempPath, "artists.json"));
  const releases = await readJSON(path.join(tempPath, "releases.json"));
  const tracks = await readJSON(path.join(tempPath, "tracks.json"));
  const groups = await readJSON(path.join(tempPath, "groups.json"));
  const collections = await readJSON(path.join(tempPath, "collections.json"));

  try {
    log("importExport:importData", "Resetting database...");

    onProgress("Clearing groups");
    await prisma.group.deleteMany();
    onProgress("Clearing groups", true);

    onProgress("Clearing collections");
    await prisma.collection.deleteMany();
    onProgress("Clearing collections", true);

    onProgress("Clearing tracks");
    await prisma.track.deleteMany();
    onProgress("Clearing tracks", true);

    onProgress("Clearing releases");
    await prisma.release.deleteMany();
    onProgress("Clearing releases", true);

    onProgress("Clearing artists");
    await prisma.artist.deleteMany();
    onProgress("Clearing artists", true);

    log("importExport:importData", "Importing artists...");
    onProgress("Importing artists");
    await prisma.artist.createMany({
      data: artists.map(
        ({
          coverReleaseId,
          groups,
          relatedArtists,
          coverGroups,
          appearsIn,
          ...x
        }: any) => x
      ),
    });
    onProgress("Importing artists", true);

    log("importExport:importData", "Importing releases...");
    onProgress("Importing releases");
    await prisma.release.createMany({
      data: releases.map(
        ({
          mainReleaseId,
          subReleases,
          collections,
          coverCollections,
          ...x
        }: any) => x
      ),
    });

    await Promise.all(
      releases.map((r: { id: number; mainReleaseId: number }) =>
        prisma.release.update({
          where: { id: r.id },
          data: {
            mainReleaseId: r.mainReleaseId,
          },
        })
      )
    );

    await Promise.all(
      artists.map((a: { id: number; coverReleaseId: number }) =>
        prisma.artist.update({
          where: { id: a.id },
          data: {
            coverReleaseId: a.coverReleaseId,
          },
        })
      )
    );
    onProgress("Importing releases", true);

    log("importExport:importData", "Importing tracks...");
    onProgress("Importing tracks");
    await prisma.track.createMany({ data: tracks });
    onProgress("Importing tracks", true);

    log("importExport:importData", "Importing collections...");
    onProgress("Importing collections");
    await prisma.collection.createMany({ data: collections });
    onProgress("Importing collections", true);

    log("importExport:importData", "Importing groups...");
    onProgress("Importing groups");
    await prisma.group.createMany({ data: groups });
    onProgress("Importing groups", true);

    log("importExport:importData", "Importing additional relationships...");
    onProgress("Importing additional relationships");
    await Promise.all(
      artists.map(
        (a: {
          id: number;
          appearsIn: [{ id: number }];
          groups: [{ id: number }];
          relatedArtists: [{ id: number }];
          coverGroups: [{ id: number }];
        }) =>
          prisma.artist.update({
            where: { id: a.id },
            data: {
              appearsIn: {
                connect: a.appearsIn,
              },
              groups: {
                connect: a.groups,
              },
              relatedArtists: {
                connect: a.relatedArtists,
              },
              coverGroups: {
                connect: a.coverGroups,
              },
            },
          })
      )
    );

    await Promise.all(
      releases.map(
        (r: {
          id: number;
          subReleases: [{ id: number }];
          collections: [{ id: number }];
          coverCollections: [{ id: number }];
        }) =>
          prisma.release.update({
            where: { id: r.id },
            data: {
              subReleases: {
                connect: r.subReleases,
              },
              collections: {
                connect: r.collections,
              },
              coverCollections: {
                connect: r.coverCollections,
              },
            },
          })
      )
    );
    onProgress("Importing additional relationships", true);

    log("importExport:importData", "Done!");
    onProgress("done");
  } catch (error) {
    log("importExport:importData", error);
    throw new Error("Error importing data");
  }
}
