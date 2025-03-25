import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ArtistWithReleasesFull } from "@/types/types";

type UseArtist = {
  isPending: boolean;
  error: Error;
  artist: ArtistWithReleasesFull;
  deleteReleases: (ids: number[]) => void;
};

export default function useArtist(id: number): UseArtist {
  const queryClient = useQueryClient();
  const { isPending, error, data: artist } = useQuery({
    queryKey: ["artists", id],
    queryFn: () => window.api.data.getArtist(id),
  });

  function onSuccess() {
    [
      ["releases", "latest"],
      ["artists", id],
    ].forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
  }

  const deleteReleases = useMutation({
    mutationFn: (ids: number[]) => {
      if (
        !window.confirm(
          `Are you sure to remove ${ids.length} Releases from Library?`
        )
      ) {
        return;
      }
      return window.api.data.deleteReleases(ids)
    },
    onSuccess
  });

  return {
    artist,
    isPending,
    error,
    deleteReleases: deleteReleases.mutate
  }
}