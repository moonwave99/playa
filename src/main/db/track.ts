import prisma from "./prisma";

export function getTrackById(id: number) {
  return prisma.track.findFirst({
    where: { id },
    include: { release: true },
  });
}
