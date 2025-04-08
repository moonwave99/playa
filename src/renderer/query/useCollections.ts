import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CollectionWithReleases } from "@/types/types";

type UseCollections = {
  isPending: boolean;
  error: Error;
  collections: CollectionWithReleases[];
  deleteCollections: (ids: number[]) => void;
};

const pageSize = 50;

export default function useCollections(): UseCollections {
  const queryClient = useQueryClient();
  const { isPending, error, data: collections } = useQuery({
    queryKey: ["collections", "latest"],
    queryFn: () => window.api.collection.getCollections({ take: pageSize }),
  });

  function onSuccess() {
    [
      ["collections"],
      ["collections", "latest"],
    ].forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
  }

  const deleteCollections = useMutation({
    mutationFn: (ids: number[]) => {
      if (
        !window.confirm(
          `Are you sure to remove ${ids.length} Collections from Library?`
        )
      ) {
        return;
      }
      return window.api.collection.deleteCollections(ids);
    },
    onSuccess
  });

  return {
    collections,
    isPending,
    error,
    deleteCollections: deleteCollections.mutate
  }
}