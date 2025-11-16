import {
  useQuery,
  keepPreviousData,
  type QueryKey,
  UseQueryResult,
} from "@tanstack/react-query";
import { DEBOUNCE_INTERVAL } from "@/constants";

type UseSearchParams<T> = {
  query: string;
  minLength?: number;
  take: number;
  queryKey: QueryKey;
  queryFn: (query: string, take?: number) => Promise<T[]>;
};

type UseSearch<T> = Omit<UseQueryResult, "data"> & {
  results: T[];
};

export default function useSearch<T>({
  query,
  minLength = 3,
  take = 50,
  queryKey,
  queryFn,
}: UseSearchParams<T>): UseSearch<T> {
  const { data: results, ...rest } = useQuery({
    queryKey,
    queryFn: () => (query?.length < minLength ? null : queryFn(query, take)),
    staleTime: DEBOUNCE_INTERVAL,
    placeholderData: keepPreviousData,
  });

  return {
    results,
    ...rest,
  };
}
