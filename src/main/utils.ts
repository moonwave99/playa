import path from "path";
import * as mm from "music-metadata";
import type {
  Artist,
  ReleaseType,
  Release,
  EntityType,
  ReleaseWithArtist,
  TrackInfo,
  TrackWithRelease,
  Notification,
} from "@/types/types";
import { globby } from "globby";
import { VARIOUS_ARTISTS_NAME, VARIOUS_ARTISTS_FOLDER } from "@/lib/utils";

export function stripPath(completePath: string, startPath: string) {
  const stripped = completePath.replace(new RegExp(`^${startPath}`), "");
  if (path.isAbsolute(stripped)) {
    return stripped.slice(1);
  }
  return stripped;
}

type GetEntityPathParam = { entityType: EntityType } & (
  | Pick<Artist, "path">
  | Pick<ReleaseWithArtist, "artist" | "path" | "type" | "year">
  | Pick<TrackWithRelease, "release" | "path">
);

export function getEntityPath(entity: GetEntityPathParam) {
  if (entity.entityType === "Artist") {
    return entity.path;
  }
  if (entity.entityType === "Release") {
    const release = entity as ReleaseWithArtist;
    if (release.completePath) {
      return release.completePath;
    }
    return path.join(
      release.artist.path,
      `[${release.type}]`,
      `${release.year} - ${release.path}`
    );
  }
  const track = entity as TrackWithRelease;
  if (track.release.completePath) {
    return path.join(track.release.completePath, track.path);
  }
  return path.join(
    track.release.artist.path,
    `[${track.release.type}]`,
    `${track.release.year} - ${track.release.path}`,
    track.path
  );
}

export function getArtistPathFromReleaseData(data: ParsePath) {
  if (data.completePath.startsWith(VARIOUS_ARTISTS_FOLDER)) {
    return VARIOUS_ARTISTS_FOLDER;
  }
  return data.completePath.split("/").slice(0, 2).join("/");
}

export async function crawlFolder(folder: string) {
  const files = await globby("*.{mp3,m4a,flac,wav,ogg,ape}", {
    cwd: folder,
    caseSensitiveMatch: false,
  });
  return files.map((file) => path.join(folder, file));
}

export async function getFolderContents(
  release: Pick<ReleaseWithArtist, "id" | "path" | "type" | "year" | "artist">,
  library_path: string
): Promise<TrackInfo[]> {
  const folder = path.join(
    library_path,
    getEntityPath({ ...release, entityType: "Release" })
  );
  const contents = await crawlFolder(folder);
  return Promise.all(contents.map(getMetadata));
}

export async function getFolderContentsFromAbsolutePath(
  folder: string
): Promise<TrackInfo[]> {
  const contents = await crawlFolder(folder);
  return Promise.all(contents.map(getMetadata));
}

async function getMetadata(
  filePath: string,
  index: number
): Promise<TrackInfo> {
  const data = await mm.parseFile(filePath);
  return {
    path: path.basename(filePath),
    title: data.common.title || path.basename(filePath),
    trackArtist: data.common.artist || "",
    duration: data.format.duration || 0,
    position: data.common.track.no || index + 1,
    meta: data.common,
  };
}

type ParsePath =
  | (Pick<Release, "type" | "path" | "year" | "title"> & {
      artist: Pick<Artist, "name">;
      completePath: string;
    })
  | null;

export function parsePath(path: string): ParsePath {
  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  if (path.startsWith(VARIOUS_ARTISTS_FOLDER)) {
    path = path.replace(
      VARIOUS_ARTISTS_FOLDER,
      `[V-A]/${VARIOUS_ARTISTS_NAME}`
    );
  }

  const tokens = path.split("/");
  if (tokens.length < 4) {
    return null;
  }

  const artist = tokens[1];
  const type = tokens[2]
    ? tokens[2].replace("[", "").replace("]", "")
    : "Album";
  const rest = tokens.slice(4);

  if (rest.length) {
    return null;
  }

  const { year, title } = parseTitle(tokens[3]);

  return {
    artist: { name: artist },
    type: type as ReleaseType,
    year,
    title,
    path: title,
    completePath: path.replace(
      `[V-A]/${VARIOUS_ARTISTS_NAME}`,
      VARIOUS_ARTISTS_FOLDER
    ),
  };
}

function parseTitle(title: string): Pick<Release, "year" | "title"> {
  const match = title.match(/^(\d{4}) - (.*)/);
  if (!match) {
    return {
      title,
      year: 0,
    };
  }
  return {
    year: Number(match[1]),
    title: match[2],
  };
}

export function withNotification(
  send: (channel: string, ...args: unknown[]) => void
) {
  return (
    fn: (...args: unknown[]) => unknown,
    notification:
      | Notification
      | ((result: ReturnType<typeof fn>) => Notification)
  ) => {
    return async (
      ...params: Parameters<typeof fn>
    ): Promise<ReturnType<typeof fn>> => {
      const result = (await fn(...params)) as ReturnType<typeof fn>;
      if (result) {
        send(
          "notify",
          typeof notification === "function"
            ? notification(result)
            : notification
        );
      }
      return result;
    };
  };
}

export function withConfirmDialog(
  openConfirmDialog: (message: string, detail: string) => boolean
) {
  return (
    fn: (...args: unknown[]) => unknown,
    dialogOptions:
      | { message: string; detail: string }
      | ((...args: Parameters<typeof fn>) => {
          message: string;
          detail: string;
        })
  ) => {
    return async (
      ...params: Parameters<typeof fn>
    ): Promise<ReturnType<typeof fn>> => {
      const { message, detail } =
        typeof dialogOptions === "function"
          ? dialogOptions(...params)
          : dialogOptions;
      if (!openConfirmDialog(message, detail)) {
        return;
      }
      return fn(...params);
    };
  };
}
