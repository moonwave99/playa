import { useInfiniteQuery } from "@tanstack/react-query";
import type { ArtistWithReleasesAndAppearances } from "@/types/types";
import api from "../api";

type UseArtists = {
  isPending: boolean;
  error: Error;
  artists: ArtistWithReleasesAndAppearances[];
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
};

type UseArtistsParams = {
  pageSize: number;
};

export default function useArtists(
  { pageSize }: UseArtistsParams = {
    pageSize: 50,
  }
): UseArtists {
  const {
    data,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["artists", "latest", pageSize],
    queryFn: (context) =>
      api.artist.getLatestArtists({
        take: pageSize,
        skip: context.pageParam,
      }),
    getNextPageParam: ({ pagination }) => {
      if (pagination.take + pagination.skip > pagination.total) {
        return;
      }
      return pagination.skip + pageSize;
    },
    initialPageParam: 0,
  });

  return {
    artists: data ? data.pages.flatMap((page) => page.results) : [],
    isPending,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  };
}
