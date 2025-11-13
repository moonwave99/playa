import prisma from "../prisma";
import { MAX_SEARCH_RESULTS, type SearchParams } from ".";
import { getCollectionLink } from "@/lib/links";
import { Unpacked } from "@/types/types";

export function search({ query, take = MAX_SEARCH_RESULTS }: SearchParams) {
  return prisma.collection.findMany({
    take,
    where: {
      title: {
        contains: query,
      },
    },
    include: {
      coverRelease: {
        include: {
          artist: true,
          additionalArtists: true,
          subReleases: true,
        },
      },
      releases: {
        where: {
          mainRelease: null,
        },
        take: 1,
      },
    },
  });
}

export function transform({
  id,
  title,
  coverRelease,
  releases,
}: Unpacked<Awaited<ReturnType<typeof search>>>) {
  return {
    entityType: "searchResult" as const,
    type: "collection" as const,
    id,
    title,
    description: "Collection",
    links: {
      collection: getCollectionLink({ id }),
    },
    coverRelease: coverRelease || releases[0],
  };
}
