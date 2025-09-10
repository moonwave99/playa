import type { Release, Artist, Track } from "@/types/types";
import { log } from "../logger";
import { lowerCaseCompare, normalizeDiacritics } from "@/lib/utils";
import { version } from "../../../package.json";
import { normalizeArtist, normalizeTitle } from ".";

type SearchParams = {
  artist: string;
  title: string;
  track?: string;
};

type DeezerResponse = {
  data: {
    album: {
      title: string;
      cover_xl: string;
    };
  }[];
};

function getDeezerQueryParam(params: SearchParams): string {
  return Object.entries(params)
    .reduce(
      (memo, [key, value]) =>
        value ? `${memo}${key}:"${normalizeDiacritics(value)}" ` : memo,
      ""
    )
    .trim();
}

export async function search(params: SearchParams): Promise<DeezerResponse> {
  const queryParams = new URLSearchParams({
    strict: "on",
    order: "ALBUM_ASC",
    q: getDeezerQueryParam(params),
  });
  const url = `https://api.deezer.com/search?${queryParams}`;
  log("covers:deezer:search", url);
  const response = await fetch(url, {
    headers: { "User-Agent": `playa/${version}` },
  });
  const data = await response.json();
  return data;
}

type SearchCoverParams = {
  release: Pick<Release, "title">;
  artist: Pick<Artist, "name">;
  track?: Pick<Track, "title">;
};

export async function searchCover({
  release,
  artist,
  track,
}: SearchCoverParams) {
  const title = normalizeTitle(release.title);
  const artistName = normalizeArtist(artist.name);
  const response = await search({
    artist: artistName,
    title,
    track: track?.title,
  });
  if (!response?.data.length) {
    log(
      `covers:deezer:searchCover', 'No response for: ${artistName} - ${title}`
    );
    return null;
  }
  const result = response.data.find((x) =>
    lowerCaseCompare(
      normalizeDiacritics(x.album.title),
      normalizeDiacritics(title)
    )
  );

  log("covers:deezer:searchCover", "Searching:", artistName, title);
  if (!result) {
    log("covers:deezer:searchCover", "No response for:", artistName, title);
    return null;
  }
  return result.album.cover_xl;
}
