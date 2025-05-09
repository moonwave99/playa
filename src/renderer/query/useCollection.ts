import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CollectionWithReleases, Release } from "@/types/types";
import api from '../api';

type UseCollection = {
  isPending: boolean;
  error: Error;
  collection: CollectionWithReleases;
  updateTitle: (title: string) => void;
  setCollectionCover: (release_id: number) => void;
  removeReleasesFromCollection: (releases: Release[]) => void;
};

export default function useCollection(id: number): UseCollection {
  const queryClient = useQueryClient();
  const { isPending, error, data: collection } = useQuery<CollectionWithReleases>({
    queryKey: ["collections", id],
    queryFn: () => api.collection.getCollection(id),
  });

  function onSuccess() {
    [
      ["collections"],
      ["collections", "latest"],
      ["collections", id],
    ].forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
  }

  const updateTitle = useMutation({
    mutationFn: (title: string) => api.collection.updateCollection(id, {
      title,
      releases: collection.releases.map(x => x.id),
    }),
    onSuccess
  });

  const removeReleasesFromCollection = useMutation({
    mutationFn: async (releases: Release[]) =>
      api.collection.removeReleasesFromCollection(id, releases.map(x => x.id)),
    onSuccess
  });

  const setCollectionCover = useMutation({
    mutationFn: (release_id: number) => api.collection.setCollectionCoverRelease(id, release_id),
    onSuccess
  });

  return {
    collection,
    isPending,
    error,
    updateTitle: updateTitle.mutate,
    removeReleasesFromCollection: removeReleasesFromCollection.mutate,
    setCollectionCover: setCollectionCover.mutate,
  }
}