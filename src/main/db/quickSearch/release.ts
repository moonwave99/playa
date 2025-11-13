import prisma from "../prisma";
import { MAX_SEARCH_RESULTS, type SearchParams } from ".";
import { getArtistLink, getReleaseLink } from "@/lib/links";
import { Unpacked } from "@/types/types";
import { getReleaseArtist, getReleaseTitle } from "@/lib/utils";

export function search({ query, take = MAX_SEARCH_RESULTS }: SearchParams) {
  return prisma.release.findMany({
    take,
    where: {
      mainRelease: null,
      normalizedTitle: {
        contains: query,
      },
    },
    orderBy: {
      title: "asc",
    },
    include: {
      artist: true,
      additionalArtists: true,
      subReleases: true,
    },
  });
}

export function transform({
  id,
  title,
  artist,
  year,
  type,
  hash,
  subReleases,
  additionalArtists,
}: Unpacked<Awaited<ReturnType<typeof search>>>) {
  return {
    entityType: "searchResult",
    type: "release" as const,
    id,
    title: getReleaseTitle({ title, subReleases }),
    hash,
    artist: getReleaseArtist({ artist, additionalArtists }),
    description: year ? `${type}, ${year}` : type,
    links: {
      release: getReleaseLink({ id }),
      artist: getArtistLink(artist),
    },
  };
}
