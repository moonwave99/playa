import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { ReleaseWithArtistAndSubreleases } from "@/types/types";
import api from "../api";

type UseReleases = {
  isPending: boolean;
  error: Error;
  releases: ReleaseWithArtistAndSubreleases[];
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  hideRelease: (release_id: number) => void;
};

const pageSize = 50;

export default function useReleases(): UseReleases {
  const queryClient = useQueryClient();
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
      api.release.getReleases({
        take: pageSize,
        skip: context.pageParam,
      }),
    getNextPageParam: (lastGroup) => lastGroup.pagination.skip + pageSize,
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
