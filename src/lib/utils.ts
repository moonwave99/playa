import { capitalize, deburr, uniqBy } from "lodash";
import type { MouseEvent } from "react";
import type {
  ReleaseType,
  Release,
  ReleaseWithArtist,
  ReleaseWithArtistAndSubreleases,
  Artist,
  ReleaseCountByType,
  ReleaseWithArtistAndTracksAndSubreleases,
  HasId,
  WithReleases,
  CollectionWithReleases,
  ArtistWithReleases,
  GroupWithArtists,
  WithAdditionalArtists,
} from "@/types/types";
import { getCover } from "./links";

const releaseTypes: ReleaseType[] = [
  "Album",
  "Compilation",
  "EP",
  "Single",
  "Bootleg",
  "Various",
  "Tribute",
  "Soundtrack",
];

export const VARIOUS_ARTISTS_FOLDER = "[V:A]";
export const VARIOUS_ARTISTS_NAME = "_VV_AA_";

export function getReleaseTitle({
  title,
  subReleases = [],
}: Pick<ReleaseWithArtistAndSubreleases, "title" | "subReleases">): string {
  if (!subReleases.length) {
    return title;
  }
  const match = title.match(/(.*) CD(\d+)/);
  return match ? match[1] : title;
}

export function getReleaseArtist({
  artist,
  additionalArtists,
}: Pick<
  ReleaseWithArtist & WithAdditionalArtists,
  "artist" | "additionalArtists"
>) {
  return [artist, ...additionalArtists]
    .map((x) => normalizeArtistName(x.name))
    .join(", ");
}

export function getUniqueArtists(releases: ReleaseWithArtist[]): Artist[] {
  return uniqBy(
    releases.map((x) => x.artist),
    (x) => x.id
  );
}

export function getMainReleaseTitle(release: ReleaseWithArtist) {
  const isDisc = release.title.match(/(.*) CD(\d+)/);
  if (!isDisc) {
    return release.title;
  }
  return isDisc[1];
}

export function countReleasesByType(releases: Release[]): ReleaseCountByType {
  return releases.reduce(
    (memo, { type }) => ({ ...memo, [type]: memo[type] ? memo[type] + 1 : 1 }),
    {} as ReleaseCountByType
  );
}

export function estimateListCardSize() {
  return {
    width: "100%",
    height: 6 * 16,
  };
}

export function normalizeTitle(title: string) {
  return title
    .replace(/ CD(\d+)/, "")
    .replaceAll(/\(\w: (.*)\)/g, "")
    .replaceAll(" : ", " / ")
    .trim();
}

export function normalizeArtistName(name: string) {
  if (name === VARIOUS_ARTISTS_NAME) {
    return "Various";
  }
  return name.replaceAll("!", "");
}

export function normalizeArtistDisplayName(name: string) {
  return name === VARIOUS_ARTISTS_NAME ? "Various Artists" : name;
}

export function getDiscInfo({ subReleases }: ReleaseWithArtistAndSubreleases) {
  return subReleases.length ? `(${subReleases.length + 1} discs)` : null;
}

export function getReleaseDuration(
  release: ReleaseWithArtistAndTracksAndSubreleases
) {
  const allTracks = [
    ...release.tracks,
    ...(release.subReleases.length
      ? release.subReleases.flatMap((x) => x.tracks)
      : []),
  ];

  return {
    trackCount: allTracks.length,
    duration: formatDuration(
      allTracks.reduce((memo, { duration }) => (memo += duration), 0)
    ),
  };
}

export function formatDuration(duration: number) {
  const date = new Date(0);
  date.setSeconds(duration);
  const formatted = date.toISOString().substring(11, 19);
  if (duration < 600) {
    return formatted.slice(4);
  }
  if (duration < 3600) {
    return formatted.slice(3);
  }
  return formatted;
}

export function isEmpty(obj: object) {
  return Object.keys(obj).length === 0;
}

export function sortBy(key: string, order: "asc" | "desc" = "asc") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (a: any, b: any) =>
    (a[key] > b[key] ? 1 : -1) * (order === "asc" ? 1 : -1);
}

export function sortReleasesByTypeAndYear(
  releases: Pick<Release, "type" | "year" | "title">[]
) {
  return releaseTypes.flatMap((type) =>
    releases
      .filter((x) => x.type === type)
      .sort((a, b) => {
        if (!a.year || !b.year) {
          return 0;
        }
        if (a.year === b.year) {
          return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
        }
        return Math.sign(a.year - b.year);
      })
  );
}

export function getReleaseWithTracklistHeight(
  release: ReleaseWithArtistAndTracksAndSubreleases
): number {
  const maxTracks = Math.max(
    ...[release, ...release.subReleases].map((x) => x.tracks?.length)
  );
  // cover height + margin + gap + tracks
  return (
    128 + 16 + 4 + (release.subReleases.length ? 32 : 0) + maxTracks * (40 + 4)
  );
}

export async function mapSeries<T, U>(
  array: T[],
  callback: (item: T, index: number) => Promise<U>,
  interval = 0
): Promise<U[]> {
  if (!array.length) {
    return [];
  }
  return new Promise((resolve) => {
    const output = [] as U[];
    async function invoke(index: number) {
      const result = await callback(array[index], index);
      output.push(result);
      await wait(interval);
      if (output.length === array.length) {
        resolve(output);
        return;
      }
      invoke(output.length);
    }
    invoke(0);
  });
}

export function sortByQueryPosition<
  K extends string,
  T extends {
    [Property in K]: string;
  },
>(query: string, key: keyof T, a: T, b: T) {
  const posA = a[key].toLowerCase().indexOf(query.toLowerCase());
  const posB = b[key].toLowerCase().indexOf(query.toLowerCase());
  return Math.sign(posA - posB);
}

export function wait(ms = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getReleaseContextMenuParams({
  selection,
  target_id,
  context,
}: {
  selection: ReleaseWithArtist[];
  target_id: number;
  context: WithReleases;
}): [ReleaseWithArtist[], WithReleases] {
  const target = context.releases.find(({ id }: HasId) => id === target_id);
  const isTargetSelected = !!selection.find((x) => x.id === target_id);

  return [
    !isTargetSelected || !selection.length ? [target] : selection,
    context,
  ];
}

export function refreshCovers(releases: Release[]) {
  releases.forEach(({ id, hash }) => {
    const targetElements = document.querySelectorAll(`img[data-id="${id}"]`);
    if (!targetElements.length) {
      return;
    }
    targetElements.forEach((element: HTMLImageElement) => {
      const seed = `${Math.random() * 100000}`.slice(0, 5);
      element.src = `${getCover(hash)}?_=${seed}`;
    });
  });
}

export function withStopPropagation(handler: (event: MouseEvent) => void) {
  return (event: MouseEvent) => {
    event.stopPropagation();
    handler(event);
  };
}

type Item =
  | CollectionWithReleases
  | ArtistWithReleases
  | ReleaseWithArtistAndSubreleases
  | GroupWithArtists;

export function getCoverRelease(
  item: Item
): ReleaseWithArtistAndSubreleases | null {
  if (item._type === "release") {
    return item;
  }
  if (item._type === "group") {
    const coverArtist = item.coverArtist || item.artists[0];
    return coverArtist ? getCoverRelease(coverArtist) : null;
  }
  return item.coverRelease || item.releases[0] || null;
}

type NewReleaseInfo = {
  newPath: string;
  newDiscTitle: string;
  newTitle: string;
  newType: ReleaseType;
  newYear: number;
};

type EditReleaseParam = Pick<
  Release,
  | "id"
  | "path"
  | "hash"
  | "title"
  | "artist_id"
  | "year"
  | "type"
  | "discTitle"
  | "discNumber"
> &
  NewReleaseInfo;

export function didReleaseInfoChange(
  infos: EditReleaseParam[],
  excludeDiscTitle?: boolean
) {
  return infos.some((x: EditReleaseParam) =>
    ["path", "title", "type", "year", "discTitle"]
      .slice(0, excludeDiscTitle ? -1 : undefined)
      .some(
        (key) =>
          x[key as keyof EditReleaseParam] !==
          x[`new${capitalize(key)}` as keyof NewReleaseInfo]
      )
  );
}

export function withCoverRelease(artist: ArtistWithReleases) {
  return {
    ...artist,
    coverRelease: artist.coverRelease || artist.releases[0],
  };
}

export function lowerCaseCompare(a: string, b: string) {
  return a.toLowerCase().includes(b.toLowerCase());
}

export function normalizeDiacritics(input: string) {
  return deburr(
    input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\((\d+)\)$/, "")
      .trim()
  );
}
