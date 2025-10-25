import { HasId } from "@/types/types";
import prisma from "./prisma";

export function getTrackById(id: number) {
  return prisma.track.findFirst({
    where: { id },
    include: { release: true },
  });
}

export async function getTrackIdsFeaturingArtist(
  query: string
): Promise<number[]> {
  const result = await prisma.$queryRaw<HasId[]>`
    SELECT t.id FROM "Track" t
    JOIN "Release" r
    ON t.releaseId = r.id
    JOIN "Artist" a
    ON a.id = r.artist_id
    WHERE t.normalizedTrackArtist
    LIKE CONCAT('%', ${query}, '%')
    AND normalizedTrackArtist != a.normalizedName;
    `;
  return result.map(({ id }) => id);
}
