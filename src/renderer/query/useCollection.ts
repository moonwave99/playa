import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CollectionWithReleases, HasId } from "@/types/types";
import api from "../api";

type UseCollection = {
  isPending: boolean;
  error: Error;
  collection: CollectionWithReleases;
  updateTitle: (title: string) => void;
  setCollectionCover: (release_id: number) => void;
  removeReleasesFromCollection: (releases: HasId[]) => void;
  addReleasesToCollection: (releases: HasId[]) => void;
};

export default function useCollection(id: number): UseCollection {
  const queryClient = useQueryClient();
  const {
    isPending,
    error,
    data: collection,
  } = useQuery<CollectionWithReleases>({
    queryKey: ["collections", id],
    queryFn: () =>
      api.collection.getCollection(id, {
        sortBy: "artistName",
        order: "asc",
      }) as Promise<CollectionWithReleases>,
  });

  function onSuccess() {
    [["collections"], ["collections", "latest"], ["collections", id]].forEach(
      (queryKey) => queryClient.invalidateQueries({ queryKey })
    );
  }

  const updateTitle = useMutation({
    mutationFn: (title: string) =>
      api.collection.updateCollection(id, {
        title,
        releases: collection.releases.map((x) => x.id),
      }),
    onSuccess,
  });

  const removeReleasesFromCollection = useMutation({
    mutationFn: async (releases: HasId[]) =>
      api.collection.removeReleasesFromCollection(
        id,
        releases.map((x) => x.id)
      ),
    onSuccess,
  });

  const addReleasesToCollection = useMutation({
    mutationFn: async (releases: HasId[]) =>
      api.collection.addReleasesToCollection(id, releases),
    onSuccess,
  });

  const setCollectionCover = useMutation({
    mutationFn: (release_id: number) =>
      api.collection.setCollectionCoverRelease(id, release_id),
    onSuccess,
  });

  return {
    collection,
    isPending,
    error,
    updateTitle: updateTitle.mutate,
    removeReleasesFromCollection: removeReleasesFromCollection.mutate,
    addReleasesToCollection: addReleasesToCollection.mutate,
    setCollectionCover: setCollectionCover.mutate,
  };
}
