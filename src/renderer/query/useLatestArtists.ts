import { useInfiniteQuery } from "@tanstack/react-query";
import type { ArtistWithReleases } from "@/types/types";

type UseLatestArtists = {
  isPending: boolean;
  error: Error;
  artists: ArtistWithReleases[];
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
};

const pageSize = 50;

export default function useLatestArtists(): UseLatestArtists {
  const {
    data,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["artists", "latest"],
    queryFn: (context) =>
      window.api.data.getLatestArtists({
        take: pageSize,
        skip: context.pageParam,
      }),
    getNextPageParam: (lastGroup) => lastGroup.pagination.skip + pageSize,
    initialPageParam: 0,
  });

  return {
    artists: data ? data.pages.flatMap((page) => page.results) : [],
    isPending,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  }
}