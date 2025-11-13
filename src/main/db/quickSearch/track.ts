import prisma from "../prisma";
import { MAX_SEARCH_RESULTS, type SearchParams } from ".";
import { getArtistLink, getReleaseLink } from "@/lib/links";
import { Unpacked } from "@/types/types";
import { normalizeArtistDisplayName } from "@/lib/utils";
import { getTrackIdsFeaturingArtist } from "../track";

export async function search({
  query,
  take = MAX_SEARCH_RESULTS,
}: SearchParams) {
  const featuringTracks = await getTrackIdsFeaturingArtist(query);
  return prisma.track.findMany({
    take,
    where: {
      OR: [
        {
          normalizedTitle: {
            contains: query,
          },
        },
        {
          id: {
            in: featuringTracks,
          },
        },
      ],
    },
    include: {
      release: {
        include: {
          artist: true,
          additionalArtists: true,
          mainRelease: true,
        },
      },
    },
  });
}

export function transform({
  id,
  title,
  trackArtist,
  release,
}: Unpacked<Awaited<ReturnType<typeof search>>>) {
  return {
    entityType: "searchResult" as const,
    type: "track" as const,
    id,
    title,
    description: "Track",
    artist:
      trackArtist && release.artist.name !== trackArtist
        ? trackArtist
        : normalizeArtistDisplayName(release.artist.name),
    links: {
      track: getReleaseLink({
        id: release.mainReleaseId || release.id,
        track_id: id,
      }),
      artist:
        trackArtist && release.artist.name !== trackArtist
          ? null
          : getArtistLink({
              id: release.artist.id,
            }),
    },
    coverRelease: release,
  };
}
