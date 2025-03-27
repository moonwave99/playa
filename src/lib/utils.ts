import { uniqBy } from 'lodash';
import type { MouseEvent } from 'react';
import type {
  ReleaseType,
  Release,
  ReleaseWithArtist,
  ReleaseWithArtistAndSubreleases,
  Artist,
  ReleaseCountByType,
  ReleaseWithArtistAndTracksAndSubreleases,
  HasId,
  WithReleases
} from "@/types/types";
import { getCover } from './links';

const releaseTypes: ReleaseType[] =
  ['Album', 'Compilation', 'EP', 'Single', 'Bootleg', 'Various', 'Tribute', 'Soundtrack'];

export function getReleaseTitle({ title, subReleases = [] }:
  Pick<ReleaseWithArtistAndSubreleases, 'title' | 'subReleases'>): string {
  if (!subReleases.length) {
    return title;
  }
  const match = title.match(/(.*) CD(\d+)/);
  return match ? match[1] : title;
}

export function getUniqueArtists(releases: ReleaseWithArtist[]): Artist[] {
  return uniqBy(releases.map(x => x.artist), (x => x.id));
}

export function getMainReleaseTitle(release: ReleaseWithArtist) {
  const isDisc = release.title.match(/(.*) CD(\d+)/);
  if (!isDisc) {
    return release.title;
  }
  return isDisc[1];
}

export function countReleasesByType(releases: Release[]): ReleaseCountByType {
  return releases.reduce((memo, { type }) => ({ ...memo, [type]: memo[type] ? memo[type] + 1 : 1 }), {} as ReleaseCountByType);
}

export function estimateReleaseGroupSize(columns: number) {
  return {
    width: window.innerWidth / columns,
    height: 120,
  };
}

export function normalizeTitle(title: string) {
  return title
    .replace(/ CD(\d+)/, "")
    .replaceAll(/\(\w: (.*)\)/g, "")
    .replaceAll(' : ', ' / ')
    .trim();
}

export function normalizeArtistName(name: string) {
  if (name === "_VV_AA_") {
    return "Various";
  }
  return name.replaceAll("!", "");
}

export function getDiscInfo({ subReleases }: ReleaseWithArtistAndSubreleases) {
  return subReleases.length
    ? `(${subReleases.length + 1} discs)`
    : null;
}

export function isEmpty(obj: object) {
  return Object.keys(obj).length === 0;
}

export function sortReleasesByTypeAndYear(releases: ReleaseWithArtist[], artist: Artist) {
  return releaseTypes
    .flatMap(type => releases
      .filter(x => x.type === type)
      .sort((a, b) => {
        if (!a.year || !b.year) {
          return 0;
        }
        if (a.year === b.year) {
          return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
        }
        return Math.sign(a.year - b.year)
      })
    ).map((x) => ({ ...x, artist }))
}

export function getReleaseWithTracklistHeight(release: ReleaseWithArtistAndTracksAndSubreleases): number {
  const maxTracks = Math.max(...[
    release,
    ...release.subReleases
  ].map(x => x.tracks?.length));
  // cover height + margin + gap + tracks
  return 128 + 32 + 4 + (maxTracks * (40 + 4));
}

export async function mapSeries<T, U>(array: T[], callback: (item: T, index: number) => Promise<U>, interval = 0): Promise<U[]> {
  if (!array.length) {
    return [];
  }
  return new Promise((resolve) => {
    const output = [] as U[];
    async function invoke(index: number) {
      const result = await callback(array[index], index);
      output.push(result);
      await wait(interval);
      output.length === array.length
        ? resolve(output)
        : invoke(output.length);
    }
    invoke(0);
  });
}

export function sortByQueryPosition<K extends string, T extends {
  [Property in K]: string;
}>(query: string, key: keyof T, a: T, b: T) {
  const posA = a[key].toLowerCase().indexOf(query.toLowerCase());
  const posB = b[key].toLowerCase().indexOf(query.toLowerCase());
  return Math.sign(posA - posB);
}

export function wait(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getReleaseContextMenuParams({
  selection,
  target_id,
  context,
}: {
  selection: ReleaseWithArtist[];
  target_id: number;
  context: WithReleases;
}): [ReleaseWithArtist[], number, WithReleases] {
  const target = context.releases.find(({ id }: HasId) => id === target_id);
  const isTargetSelected = !!selection.find((x) => x.id === target_id);

  return [
    !isTargetSelected || !selection.length ? [target] : selection,
    target_id,
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
      element.src = getCover(hash);
    });
  })
}

export function withStopPropagation(handler: (event: MouseEvent) => void) {
  return (event: MouseEvent) => {
    event.stopPropagation();
    handler(event);
  };
}