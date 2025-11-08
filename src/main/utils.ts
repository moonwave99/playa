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
  WithTracks,
} from "@/types/types";
import { globby } from "globby";

export function stripPath(fullPath: string, startPath: string) {
  const stripped = fullPath.replace(new RegExp(`^${startPath}`), "");
  if (path.isAbsolute(stripped)) {
    return stripped.slice(1);
  }
  return stripped;
}

type GetEntityPathParam = { entityType: EntityType } & (
  | Pick<Release, "path">
  | Pick<TrackWithRelease, "release" | "path">
);

export function getEntityPath(entity: GetEntityPathParam) {
  if (entity.entityType === "release") {
    return entity.path;
  }
  const track = entity as TrackWithRelease;
  return path.join(track.release.path, track.path);
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
    getEntityPath({ ...release, entityType: "release" })
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

type GetReleaseDataFromTrackInfoParams = {
  folder: string;
  tracks: TrackInfo[];
};

type ReleaseInfo =
  | (Pick<Release, "type" | "year" | "title"> & {
      artist: Pick<Artist, "name">;
      fullPath: string;
    })
  | null;

export function findKeyInTrackMeta(
  tracks: TrackInfo[],
  key: keyof TrackInfo["meta"]
) {
  return tracks.find((x) => !!x.meta[key])?.meta[key];
}

export function getReleaseDataFromTrackInfo({
  folder,
  tracks,
}: GetReleaseDataFromTrackInfoParams): ReleaseInfo {
  return {
    artist: {
      name: findKeyInTrackMeta(tracks, "artist") as string,
    },
    type: "Album",
    title: findKeyInTrackMeta(tracks, "album") as string,
    fullPath: folder,
    year: +findKeyInTrackMeta(tracks, "year") as number,
  };
}

type ParsePath =
  | (Pick<Release, "type" | "year" | "title"> & {
      artist: Pick<Artist, "name">;
      fullPath: string;
    })
  | null;

export function parsePath(path: string): ParsePath {
  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (path.startsWith("/")) {
    path = path.slice(1);
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
    fullPath: path,
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
    getNotification:
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
          typeof getNotification === "function"
            ? getNotification(result)
            : getNotification
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
    getDialogOptions:
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
        typeof getDialogOptions === "function"
          ? getDialogOptions(...params)
          : getDialogOptions;
      if (!openConfirmDialog(message, detail)) {
        return false;
      }
      return fn(...params);
    };
  };
}

// see: https://stackoverflow.com/a/47884580/1073758
export function getCommonPathPrefix(paths: string[]) {
  const sortedArray = paths.toSorted().map((x) => x.split(path.sep));
  const first = sortedArray.at(0);
  const last = sortedArray.at(-1);
  const length = first.length;
  let index = 0;

  while (index < length && first[index] === last[index]) {
    index++;
  }
  return first.slice(0, index).join(path.sep);
}

type CheckReleaseContentsMatchParams = {
  release: Release & WithTracks;
  newFolder: string;
  warnOnContentDifference?: boolean;
};

export type CheckReleaseContentsMatch = {
  status: "EMPTY_FOLDER" | "CONTENT_MISMATCH" | "CONTENT_MATCH";
  newFolder: string;
  newContents: TrackInfo[];
};

export async function checkReleaseContentsMatch({
  release,
  newFolder,
  warnOnContentDifference = true,
}: CheckReleaseContentsMatchParams): Promise<CheckReleaseContentsMatch> {
  const newContents = await getFolderContentsFromAbsolutePath(newFolder);

  if (!newContents.length) {
    return {
      status: "EMPTY_FOLDER",
      newFolder,
      newContents: [],
    };
  }

  const sortedNewContents = newContents.toSorted((a, b) =>
    a.path > b.path ? 1 : -1
  );

  if (
    warnOnContentDifference &&
    release.tracks
      .toSorted((a, b) => (a.path > b.path ? 1 : -1))
      .some((x, index) => x.title !== sortedNewContents[index]?.title)
  ) {
    return {
      status: "CONTENT_MISMATCH",
      newFolder,
      newContents: [],
    };
  }

  return {
    status: "CONTENT_MATCH",
    newFolder,
    newContents: newContents,
  };
}
