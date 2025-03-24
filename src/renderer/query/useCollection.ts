import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CollectionWithReleases, HasId } from "@/types/types";

type UseCollection = {
  isPending: boolean;
  error: Error;
  collection: CollectionWithReleases;
  updateTitle: (title: string) => void;
  deleteReleasesFromCollection: (releases: HasId[]) => void;
};

export default function useCollection(id: number): UseCollection {
  const queryClient = useQueryClient();
  const { isPending, error, data: collection } = useQuery({
    queryKey: ["collections", id],
    queryFn: () => window.api.data.getCollection(id),
  });

  function onSuccess() {
    [
      ["collections"],
      ["collections", "latest"],
      ["collections", id],
    ].forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
  }

  const updateTitle = useMutation({
    mutationFn: (title: string) => window.api.data.updateCollection(id, {
      title,
      releases: collection.releases.map(({ id }: HasId) => id),
    }),
    onSuccess
  });

  const deleteReleasesFromCollection = useMutation({
    mutationFn: async (releases: HasId[]) => {
      if (
        !window.confirm(
          `Are you sure to remove ${releases.length} Releases from Collection?`
        )
      ) {
        return;
      }
      const ids = releases.map(({ id }) => id);
      return window.api.data.updateCollection(id, {
        title: collection.title,
        releases: collection.releases
          .map(({ id }: HasId) => id)
          .filter((id: number) => !ids.includes(id)),
      });
    },
    onSuccess
  });

  return {
    collection,
    isPending,
    error,
    updateTitle: updateTitle.mutate,
    deleteReleasesFromCollection: deleteReleasesFromCollection.mutate
  }
}