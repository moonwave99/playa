import {
  GroupWithArtists,
  Artist,
  CollectionWithReleases,
  Release,
} from "@/types/types";
import {
  CollisionDetection,
  DragEndEvent,
  rectIntersection,
} from "@dnd-kit/core";
import api from "./api";
import { UseRefetch } from "./hooks/useRefetch";

export async function handleDropEnd(event: DragEndEvent, refetch: UseRefetch) {
  const { active, over } = event;
  if (
    !over ||
    (!over.data.current.accepts.includes(active.data.current.entityType) &&
      !over.data.current.accepts.includes(active.data.current.type))
  ) {
    return;
  }

  let queryKey;
  if (`${over.id}`.startsWith("group")) {
    queryKey = await onGroupDrop(event);
  }
  if (`${over.id}`.startsWith("collection")) {
    queryKey = await onCollectionDrop(event);
  }
  if (queryKey) {
    refetch(queryKey);
  }
}

async function onGroupDrop({ active, over }: DragEndEvent) {
  const group = over.data.current as GroupWithArtists;
  const artist = active.data.current as Artist;

  if (group.artists.find((x) => x.id === artist.id)) {
    return;
  }

  await api.group.addArtistsToGroup(group.id, [artist]);

  return [
    ["groups", "latest"],
    ["groups", group.id],
  ];
}

async function onCollectionDrop({ active, over }: DragEndEvent) {
  const collection = over.data.current as CollectionWithReleases;
  const release = active.data.current as Release;

  if (collection.releases.find((x) => x.id === release.id)) {
    return;
  }

  await api.collection.addReleasesToCollection(collection.id, [release]);

  return [
    ["collections", "latest"],
    ["collections", collection.id],
  ];
}

// #SEE https://github.com/clauderic/dnd-kit/pull/334#issuecomment-1965708784
export const fixCursorSnapOffset: CollisionDetection = (args) => {
  // Bail out if keyboard activated
  if (!args.pointerCoordinates) {
    return rectIntersection(args);
  }
  const { x, y } = args.pointerCoordinates;
  const { width, height } = args.collisionRect;
  const updated = {
    ...args,
    // The collision rectangle is broken when using snapCenterToCursor. Reset
    // the collision rectangle based on pointer location and overlay size.
    collisionRect: {
      width,
      height,
      bottom: y + height / 2,
      left: x - width / 2,
      right: x + width / 2,
      top: y - height / 2,
    },
  };
  return rectIntersection(updated);
};
