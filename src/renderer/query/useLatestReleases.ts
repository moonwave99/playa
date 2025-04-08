import { useInfiniteQuery } from "@tanstack/react-query";
import type { ReleaseWithArtistAndSubreleases } from "@/types/types";

type UseLatestReleases = {
  isPending: boolean;
  error: Error;
  releases: ReleaseWithArtistAndSubreleases[];
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
};

const pageSize = 50;

export default function useLatestReleases(): UseLatestReleases {
  const {
    data,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["releases", "latest"],
    queryFn: (context) =>
      window.api.release.getLatestReleases({
        take: pageSize,
        skip: context.pageParam,
      }),
    getNextPageParam: (lastGroup) => lastGroup.pagination.skip + pageSize,
    initialPageParam: 0,
  });

  return {
    releases: data ? data.pages.flatMap((page) => page.results) : [],
    isPending,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  }
}