import {
  useQuery,
  keepPreviousData,
  type QueryKey,
} from "@tanstack/react-query";
import { DEBOUNCE_INTERVAL } from "@/constants";

type UseSearchParams<T> = {
  query: string;
  minLength?: number;
  take: number;
  queryKey: QueryKey;
  queryFn: (query: string, take?: number) => Promise<T[]>;
};

type UseSearch<T> = {
  isPending: boolean;
  error: Error;
  results: T[];
};

export default function useSearch<T>({
  query,
  minLength = 3,
  take = 50,
  queryKey,
  queryFn,
}: UseSearchParams<T>): UseSearch<T> {
  const {
    isPending,
    error,
    data: results,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (query?.length < minLength) {
        return [];
      }
      return queryFn(query, take);
    },
    staleTime: DEBOUNCE_INTERVAL,
    placeholderData: keepPreviousData,
  });

  return {
    results: results || [],
    isPending,
    error,
  };
}
