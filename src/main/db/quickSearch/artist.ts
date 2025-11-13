import prisma from "../prisma";
import { MAX_SEARCH_RESULTS, type SearchParams } from ".";
import { getArtistLink } from "@/lib/links";
import { Unpacked } from "@/types/types";

export function search({ query, take = MAX_SEARCH_RESULTS }: SearchParams) {
  return prisma.artist.findMany({
    where: {
      normalizedName: {
        contains: query,
      },
    },
    include: {
      coverRelease: {
        include: {
          artist: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      appearsIn: {
        include: { artist: true },
      },
      releases: {
        where: {
          mainRelease: null,
        },
        take: 1,
        include: {
          artist: {
            select: {
              id: true,
              name: true,
            },
          },
          subReleases: {
            include: {
              artist: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    take,
  });
}

export function transform({
  id,
  name,
  coverRelease,
  releases,
  appearsIn,
}: Unpacked<Awaited<ReturnType<typeof search>>>) {
  return {
    entityType: "searchResult" as const,
    type: "artist" as const,
    id,
    title: name,
    description: "Artist",
    links: {
      artist: getArtistLink({ id }),
    },
    coverRelease: coverRelease || releases[0] || appearsIn[0] || null,
    releases,
  };
}
