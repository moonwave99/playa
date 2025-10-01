import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CollectionWithReleases, type HasId } from "@/types/types";
import api from "../api";

type AddReleasesToCollectionParams = {
  id: number;
  releases: HasId[];
};

type AddReleasesToNewCollectionParams = {
  title: string;
  releases: HasId[];
};

type UseCollections = {
  isPending: boolean;
  error: Error;
  collections: CollectionWithReleases[];
  deleteCollections: (ids: number[]) => void;
  addReleasesToCollection: (params: AddReleasesToCollectionParams) => void;
  addReleasesToNewCollection: (
    params: AddReleasesToNewCollectionParams
  ) => void;
};

const pageSize = 50;

export default function useCollections(): UseCollections {
  const queryClient = useQueryClient();
  const {
    isPending,
    error,
    data: collections,
  } = useQuery({
    queryKey: ["collections", "latest"],
    queryFn: () =>
      api.collection.getCollections({
        take: pageSize,
      }) as Promise<CollectionWithReleases[]>,
  });

  function onSuccess() {
    [["collections"], ["collections", "latest"]].forEach((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    );
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
      return api.collection.deleteCollections(ids);
    },
    onSuccess,
  });

  function onAddReleasesToCollectionSuccess(
    collection: CollectionWithReleases,
    { releases }: { releases: HasId[] }
  ) {
    [
      ["collections", collection.id],
      ...releases.map((x) => ["releases", x.id]),
    ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
  }

  const addReleasesToCollection = useMutation({
    mutationFn: ({ id, releases }: AddReleasesToCollectionParams) =>
      api.collection.addReleasesToCollection(id, releases),
    onSuccess: onAddReleasesToCollectionSuccess,
  });

  const addReleasesToNewCollection = useMutation({
    mutationFn: ({ title, releases }: AddReleasesToNewCollectionParams) =>
      api.collection.addReleasesToNewCollection(title, releases),
    onSuccess: onAddReleasesToCollectionSuccess,
  });

  return {
    collections,
    isPending,
    error,
    deleteCollections: deleteCollections.mutate,
    addReleasesToCollection: addReleasesToCollection.mutate,
    addReleasesToNewCollection: addReleasesToNewCollection.mutate,
  };
}
