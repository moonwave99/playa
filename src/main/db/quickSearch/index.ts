import { EntityType, SearchResult } from "@/types/types";

import * as artist from "./artist";
import * as release from "./release";
import * as track from "./track";
import * as collection from "./collection";
import * as group from "./group";

export type SearchParams = {
  query: string;
  take?: number;
};

export const MAX_SEARCH_RESULTS = 3;

const rankMap: Record<EntityType, number> = {
  artist: 10000,
  release: 1000,
  track: 100,
  collection: 10,
  group: 10,
};

export async function getResults(
  params: SearchParams
): Promise<SearchResult[]> {
  const artists = await artist.search(params);
  const releases = await release.search(params);
  const tracks = await track.search(params);
  const collections = await collection.search(params);
  const groups = await group.search(params);

  return rankResults(
    [
      ...artists.map(artist.transform),
      ...releases.map(release.transform),
      ...tracks.map(track.transform),
      ...collections.map(collection.transform),
      ...groups.map(group.transform),
    ],
    params.query
  ) as SearchResult[];
}

function rankResults<T extends Pick<SearchResult, "title" | "type">>(
  results: T[],
  query: string
): (T & { rank: number })[] {
  return results
    .map((x) => {
      const rank =
        getRankForString(x.title.toLowerCase(), query.toLowerCase()) *
        rankMap[x.type];
      return { ...x, rank };
    })
    .sort((a, b) => b.rank - a.rank);
}

function getRankForString(value: string, query: string) {
  if (value === query) {
    return 1;
  }
  if (value.startsWith(query)) {
    return 0.8;
  }
  return 0.5;
}
