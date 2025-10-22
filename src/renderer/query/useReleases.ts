import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { ReleaseWithArtistAndSubReleases } from "@/types/types";
import api from "../api";

type UseReleases = {
  isPending: boolean;
  error: Error;
  releases: ReleaseWithArtistAndSubReleases[];
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  hideRelease: (release_id: number) => void;
};

type UseReleasesParams = {
  pageSize: number;
};

export default function useReleases(
  { pageSize }: UseReleasesParams = {
    pageSize: 50,
  }
): UseReleases {
  const queryClient = useQueryClient();
  const {
    data,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["releases", "latest", pageSize],
    queryFn: ({ pageParam }) =>
      api.release.getReleases({
        take: pageSize,
        skip: pageParam,
      }),
    getNextPageParam: ({ pagination }) => {
      if (pagination.take + pagination.skip > pagination.total) {
        return;
      }
      return pagination.skip + pageSize;
    },
    initialPageParam: 0,
  });

  const hideRelease = useMutation({
    mutationFn: (release_id: number) => api.release.hideRelease(release_id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["releases", "latest"] }),
  });

  return {
    releases: data ? data.pages.flatMap((page) => page.results) : [],
    isPending,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    hideRelease: hideRelease.mutate,
  };
}
