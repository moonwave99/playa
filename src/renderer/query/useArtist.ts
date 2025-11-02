import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ArtistWithReleasesFull } from "@/types/types";
import api from "../api";

type UseArtist = {
  isPending: boolean;
  error: Error;
  artist: ArtistWithReleasesFull;
  deleteReleases: (release_ids: number[]) => void;
  setArtistCover: (release_id: number) => void;
  addRelatedArtist: (artist_id: number) => void;
  removeRelatedArtist: (artist_id: number) => void;
  removeFromGroup: (group_id: number) => void;
  editArtist: (...params: Parameters<typeof api.artist.editArtist>) => void;
};

export default function useArtist(id: number): UseArtist {
  const queryClient = useQueryClient();
  const {
    isPending,
    error,
    data: artist,
  } = useQuery({
    queryKey: ["artists", id],
    queryFn: () =>
      api.artist.getArtist(id) as unknown as Promise<ArtistWithReleasesFull>,
  });

  function onSuccess() {
    [
      ["releases", "latest"],
      ["artists", id],
      ...artist.groups.map((x) => ["groups", x.id]),
    ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
  }

  const deleteReleases = useMutation({
    mutationFn: (release_ids: number[]) =>
      api.release.deleteReleases(release_ids, artist),
    onSuccess,
  });

  const setArtistCover = useMutation({
    mutationFn: (release_id: number) =>
      api.artist.setArtistCoverRelease(id, release_id),
    onSuccess,
  });

  const removeRelatedArtist = useMutation({
    mutationFn: (artist_id: number) =>
      api.artist.removeRelatedArtist(id, artist_id),
    onSuccess,
  });

  const addRelatedArtist = useMutation({
    mutationFn: (artist_id: number) =>
      api.artist.addRelatedArtist(id, artist_id),
    onSuccess,
  });

  const removeFromGroup = useMutation({
    mutationFn: (group_id: number) =>
      api.group.removeArtistsFromGroup(group_id, [id]),
    onSuccess,
  });

  const editArtist = useMutation({
    mutationFn: api.artist.editArtist,
    onSuccess,
  });

  return {
    artist,
    isPending,
    error,
    deleteReleases: deleteReleases.mutate,
    setArtistCover: setArtistCover.mutate,
    addRelatedArtist: addRelatedArtist.mutate,
    removeRelatedArtist: removeRelatedArtist.mutate,
    removeFromGroup: removeFromGroup.mutate,
    editArtist: editArtist.mutate,
  };
}
