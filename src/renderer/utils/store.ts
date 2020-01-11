type Entity = {
  _id: string;
}

export interface EntityHashMap<T> {
  [key: string]: T;
}

export function toObj<T extends Entity>(array: T[]): EntityHashMap<T> {
  return array.reduce((memo: EntityHashMap<T>, entity: T) => {
    memo[entity._id] = entity;
    return memo;
  }, {});
}

export function removeIds<T extends Entity>(hashMap: EntityHashMap<T>, ids: Entity['_id'][]): EntityHashMap<T> {
  return Object.keys(hashMap)
    .filter((id) => !ids.includes(id))
    .reduce((memo: EntityHashMap<T>, id) => {
      memo[id] = hashMap[id];
      return memo;
    }, {});
}
