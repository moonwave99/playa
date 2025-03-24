import { useQuery } from "@tanstack/react-query";
import type { CollectionWithReleases } from "@/types/types";

type UseCollections = {
  isPending: boolean;
  error: Error;
  collections: CollectionWithReleases[];
};

const pageSize = 50;

export default function useCollections(): UseCollections {
  const { isPending, error, data: collections } = useQuery({
    queryKey: ["collections", "latest"],
    queryFn: () => window.api.data.getCollections({ take: pageSize }),
  });

  return {
    collections,
    isPending,
    error,
  }
}