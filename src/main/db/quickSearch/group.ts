import prisma from "../prisma";
import { MAX_SEARCH_RESULTS, type SearchParams } from ".";
import { getGroupLink } from "@/lib/links";
import { ArtistWithReleasesAndAppearances, Unpacked } from "@/types/types";
import { getCoverRelease } from "@/lib/utils";

export function search({ query, take = MAX_SEARCH_RESULTS }: SearchParams) {
  return prisma.group.findMany({
    take,
    where: {
      title: {
        contains: query,
      },
    },
    include: {
      coverArtist: {
        include: {
          coverRelease: {
            include: {
              artist: true,
            },
          },
          releases: {
            take: 1,
            where: {
              mainRelease: null,
            },
            include: {
              artist: true,
            },
          },
        },
      },
      artists: {
        take: 1,
        include: {
          coverRelease: true,
          releases: { take: 1 },
          appearsIn: { take: 1 },
        },
      },
    },
  });
}

export function transform({
  id,
  title,
  coverArtist,
}: Unpacked<Awaited<ReturnType<typeof search>>>) {
  return {
    entityType: "searchResult" as const,
    type: "group" as const,
    id,
    title,
    description: "Group",
    links: {
      group: getGroupLink({ id }),
    },
    coverRelease: coverArtist
      ? getCoverRelease(coverArtist as ArtistWithReleasesAndAppearances)
      : null,
  };
}
