import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { SearchResult } from "@/types/types";

type UseSearch = {
  isPending: boolean;
  error: Error;
  results: SearchResult[];
};

const DEBOUNCE_MS = 300;

export default function useSearch(query: string): UseSearch {
  const { isPending, error, data: results } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query) {
        return [];
      }
      return window.api.data.search(query, 100);
    },
    staleTime: DEBOUNCE_MS,
    placeholderData: keepPreviousData,
  });

  return {
    results,
    isPending,
    error,
  }
}