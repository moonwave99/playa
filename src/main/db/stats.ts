import prisma from "./prisma";
import type { SearchableEntities, Stats } from "@/types/types";

export async function getStats(): Promise<Stats> {
  const entities = ['artist', 'release', 'track', 'collection', 'group'] as SearchableEntities[];

  const data = await Promise.all(entities.map(entity => prisma[entity].aggregate({
    _count: { id: true },
    ...(entity === 'release' ? { where: { mainRelease: null } } : {})
  })));

  return entities.reduce((memo, entity, index) => ({
    [entity]: data[index]._count.id,
    ...memo
  }), {} as Stats);
}