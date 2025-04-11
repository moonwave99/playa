import { GroupWithArtists, Artist, CollectionWithReleases, Release } from "@/types/types";
import { DragEndEvent } from "@dnd-kit/core";
import api from "./api";
import { UseRefetch } from "./hooks/useRefetch";

export async function handleDropEnd(event: DragEndEvent, refetch: UseRefetch) {
  const { active, over } = event;
  if (!over) {
    return;
  }
  if (
    !over.data.current.accepts.includes(active.data.current._type) &&
    !over.data.current.accepts.includes(active.data.current.type)
  ) {
    return;
  }
  let queryKey;
  if (event.over.id === "group") {
    queryKey = await onGroupDrop(event);
  }
  if (event.over.id === "collection") {
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

  return ["groups", group.id];
}

async function onCollectionDrop({ active, over }: DragEndEvent) {
  const collection = over.data.current as CollectionWithReleases;
  const release = active.data.current as Release;

  if (collection.releases.find((x) => x.id === release.id)) {
    return;
  }

  await api.collection.addReleasesToCollection(collection.id, [release]);

  return ["collections", collection.id];
}
