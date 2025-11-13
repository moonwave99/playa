import type { MouseEvent } from "react";
import { capitalize, deburr, uniqBy, isPlainObject } from "lodash";
import {
  releaseTypes,
  ReleaseType,
  Release,
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
  Artist,
  ReleaseCountByType,
  ReleaseWithArtistAndTracksAndSubreleases,
  WithReleases,
  CollectionWithReleases,
  ArtistWithReleases,
  GroupWithArtists,
  ColorInfo,
  Group,
  Collection,
  WithCoverRelease,
  SearchResult,
  ArtistWithReleasesAndAppearances,
  EntityType,
  HasId,
} from "@/types/types";
import { VARIOUS_ARTISTS_NAME } from "@/constants";

export function getReleaseTitle({
  title,
  subReleases = [],
}: {
  title: string;
  subReleases: unknown[];
}): string {
  if (!subReleases.length) {
    return title;
  }
  const match = title.match(/(.*) CD(\d+)/);
  return match ? match[1] : title;
}

export function getReleaseFullTitle(release: ReleaseWithArtistAndSubReleases) {
  return `${normalizeArtistDisplayName(release.artist.name)} - ${getReleaseTitle(release)}`;
}

export function getReleaseArtist({
  artist,
  additionalArtists,
}: {
  artist: Pick<Artist, "name">;
  additionalArtists: Pick<Artist, "name">[];
}) {
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

export function getDiscInfo({ subReleases }: ReleaseWithArtistAndSubReleases) {
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

type Sortable = number | string | boolean | Date;

export function sortBy(key: string, order: "asc" | "desc" = "asc") {
  return (a: Record<string, Sortable>, b: Record<string, Sortable>) =>
    (a[key] > b[key] ? 1 : -1) * (order === "asc" ? 1 : -1);
}

export function sortReleasesByTypeAndYear<T extends Release>(releases: T[]) {
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

export function getReleaseContextMenuParams<T extends WithReleases>({
  selection,
  target_id,
  context,
}: {
  selection: ReleaseWithArtist[];
  target_id: number;
  context: T;
}): [ReleaseWithArtist[], T] {
  const target = context.releases.find(({ id }) => id === target_id);
  const isTargetSelected = !!selection.find(({ id }) => id === target_id);

  return [
    !isTargetSelected || !selection.length ? [target] : selection,
    context,
  ];
}

export function refreshCovers(releases: HasId[]) {
  releases.forEach(({ id }) =>
    document
      .querySelectorAll(`img[data-id="${id}"]`)
      .forEach((element: HTMLImageElement) => {
        const seed = `${Math.random() * 100000}`.slice(0, 5);
        element.src = `${element.src.split("?").at(0)}?_=${seed}`;
      })
  );
}

export function withStopPropagation(handler: (event: MouseEvent) => void) {
  return (event: MouseEvent) => {
    event.stopPropagation();
    handler(event);
  };
}

type Item =
  | CollectionWithReleases
  | ArtistWithReleasesAndAppearances
  | ReleaseWithArtistAndSubReleases
  | GroupWithArtists
  | SearchResult;

export function getCoverRelease(
  item: Item
): ReleaseWithArtistAndSubReleases | null {
  if (item.entityType === "release") {
    return item as ReleaseWithArtistAndSubReleases;
  }
  if (item.entityType === "group") {
    const coverArtist =
      (item as GroupWithArtists).coverArtist ||
      (item as GroupWithArtists).artists?.at(0);
    return coverArtist ? getCoverRelease(coverArtist) : null;
  }
  if (item.entityType === "artist") {
    return (item.coverRelease ||
      item.releases?.at(0) ||
      item.appearsIn?.at(0) ||
      null) as ReleaseWithArtistAndSubReleases;
  }
  return (item.coverRelease ||
    item.releases?.at(0) ||
    null) as ReleaseWithArtistAndSubReleases;
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

export function withCoverRelease(
  artist: ArtistWithReleases
): ArtistWithReleases & WithCoverRelease {
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

export function groupItemsByLetter(items: (Artist | Collection | Group)[]) {
  return Object.entries(
    Object.groupBy(items, (item) => {
      const letter = (item.entityType === "artist" ? item.name : item.title)
        .at(0)
        .toLowerCase();

      if (!letter.match(/^[A-Za-z]/)) {
        return "#";
      }
      return letter;
    })
  );
}

export const pad = (n = 1) => (n < 10 ? `0${n}` : `${n}`);

export function getColorInfo(
  release: Release,
  useRainbowMode = true
): ColorInfo {
  if (!release?.colorInfo || !useRainbowMode) {
    return {
      color: null,
      darkText: false,
    };
  }
  return release.colorInfo as ColorInfo;
}

export function ensurePlural(value: string) {
  return capitalize(value.endsWith("s") ? value : `${value}s`);
}

type GetCoversItem =
  | CollectionWithReleases
  | ArtistWithReleasesAndAppearances
  | GroupWithArtists
  | ReleaseWithArtistAndSubReleases;

type GetCovers = {
  coverRelease: ReleaseWithArtistAndSubReleases;
  otherReleases: ReleaseWithArtistAndSubReleases[];
};

export function getCovers(item: GetCoversItem, count = Infinity): GetCovers {
  const coverRelease = getCoverRelease(item);

  let otherReleases: ReleaseWithArtistAndSubReleases[];
  if (item.entityType === "group") {
    otherReleases = item.artists.map(getCoverRelease);
  } else if (item.entityType === "artist") {
    otherReleases = [
      ...(item.releases || []),
      ...(item.appearsIn || []),
    ] as ReleaseWithArtistAndSubReleases[];
  } else if (item.entityType === "collection") {
    otherReleases = item.releases;
  } else {
    otherReleases = [];
  }

  return {
    coverRelease,
    otherReleases: otherReleases
      .filter((x) => x.id !== coverRelease?.id)
      .slice(0, count - 1),
  };
}

type FormatEntityTypeOptions = {
  capital?: boolean;
  plural?: boolean;
};

export function formatEntityType(
  entityType: EntityType,
  { capital = true, plural = false }: FormatEntityTypeOptions = {}
): string {
  let output: string = entityType;
  if (capital) {
    output = capitalize(output);
  }
  return plural ? `${output}s` : output;
}

export function toDotNotation(
  entry: Record<string, unknown>,
  accumulator: Record<string, unknown> = {},
  keys: string[] = []
) {
  return {
    ...accumulator,
    ...Object.entries(entry).reduce(
      (
        memo,
        [key, value]: [string, Record<string, unknown>]
      ): Record<string, unknown> => {
        const dottedKey = [...keys, key].join(".");
        return isPlainObject(value)
          ? {
              ...memo,
              ...toDotNotation(value, accumulator, [...keys, key]),
            }
          : {
              ...memo,
              [dottedKey]: value,
            };
      },
      accumulator
    ),
  };
}
