import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ArtistWithReleasesFull } from "@/types/types";
import api from '../api';

type UseArtist = {
  isPending: boolean;
  error: Error;
  artist: ArtistWithReleasesFull;
  deleteReleases: (release_ids: number[]) => void;
  setArtistCover: (release_id: number) => void;
};

export default function useArtist(id: number): UseArtist {
  const queryClient = useQueryClient();
  const { isPending, error, data: artist } = useQuery({
    queryKey: ["artists", id],
    queryFn: () => api.artist.getArtist(id),
  });

  function onSuccess() {
    [
      ["releases", "latest"],
      ["artists", id],
      ...artist.groups.map(x => ['groups', x.id]),
    ].forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
  }

  const deleteReleases = useMutation({
    mutationFn: api.release.deleteReleases,
    onSuccess
  });

  const setArtistCover = useMutation({
    mutationFn: (release_id: number) => api.artist.setArtistCoverRelease(id, release_id),
    onSuccess
  })

  return {
    artist,
    isPending,
    error,
    deleteReleases: deleteReleases.mutate,
    setArtistCover: setArtistCover.mutate,
  }
}