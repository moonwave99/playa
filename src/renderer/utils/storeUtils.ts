type Entity = {
  _id: string;
}

export interface EntityHashMap<T> {
  [key: string]: T;
}

export function toArray<T>(hashMap: EntityHashMap<T>): T[] {
  return Object.keys(hashMap).map((id) => hashMap[id]);
}

export function toObj<T extends Entity>(array: T[]): EntityHashMap<T> {
  return array.reduce((memo: EntityHashMap<T>, entity: T) => {
    memo[entity._id] = entity;
    return memo;
  }, {});
}

export function updateId<T extends Entity>(
  hashMap: EntityHashMap<T>,
  id: T['_id'],
  value: T
): EntityHashMap<T> {
  return {
    ...hashMap,
    [id]: value
  };
}

export function removeIds<T extends Entity>(
  hashMap: EntityHashMap<T>,
  ids: Entity['_id'][]
): EntityHashMap<T> {
  return Object.keys(hashMap)
    .filter((id) => !ids.includes(id))
    .reduce((memo: EntityHashMap<T>, id) => {
      memo[id] = hashMap[id];
      return memo;
    }, {});
}

export function ensureAll<T> (
  entities: object[],
  getDefault: Function
): T[] {
  return entities.map((entity: object) => ({ ...getDefault(), ...entity}));
}

export function immutableMove<T>(
  array: T[],
  from: number,
  to: number
): T[] {
  return array.reduce((prev: T[], current: T, idx: number, self: T[]) => {
    if (from === to) {
      prev.push(current);
    }
    if (idx === from) {
      return prev;
    }
    if (from < to) {
      prev.push(current);
    }
    if (idx === to) {
      prev.push(self[from]);
    }
    if (from > to) {
      prev.push(current);
    }
    return prev;
  }, [] as  T[]);
}

export function immutableInsertAtIndex<T>(
  array: T[],
  insert: T,
  index: number
): T[] {
  return [
    ...array.slice(0, index),
    insert,
    ...array.slice(index)
  ];
}

export function immutableInsertArrayAtIndex<T>(
  array: T[],
  arrayToInsert: T[],
  index: number
): T[] {
  return [
    ...array.slice(0, index),
    ...arrayToInsert,
    ...array.slice(index)
  ];
}
