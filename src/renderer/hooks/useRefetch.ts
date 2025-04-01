import { useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";

type UseRefetch = (queryKey: QueryKey) => void;

export default function useRefetch(): UseRefetch {
  const queryClient = useQueryClient();

  function refetch(queryKey: QueryKey) {
    Array.isArray(queryKey[0])
      ? queryKey.forEach((q: QueryKey) =>
        queryClient.refetchQueries({ queryKey: q })
      )
      : queryClient.refetchQueries({ queryKey });
  }

  return refetch;
}