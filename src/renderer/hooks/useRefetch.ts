import { useQueryClient, type QueryKey } from "@tanstack/react-query";

export type UseRefetch = (queryKey: QueryKey) => void;

export default function useRefetch(): UseRefetch {
  const queryClient = useQueryClient();

  function refetch(queryKey: QueryKey) {
    if (!Array.isArray(queryKey[0])) {
      queryClient.refetchQueries({ queryKey });
      return;
    }
    queryKey.forEach((q: QueryKey) =>
      queryClient.refetchQueries({ queryKey: q })
    );
  }

  return refetch;
}
