import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GroupWithArtists, HasId } from "@/types/types";
import api from '../api';

type UseGroup = {
  isPending: boolean;
  error: Error;
  group: GroupWithArtists;
  updateTitle: (title: string) => void;
  deleteArtistsFromGroup: (artists: HasId[]) => void;
};

export default function useGroup(id: number): UseGroup {
  const queryClient = useQueryClient();
  const { isPending, error, data: group } = useQuery({
    queryKey: ["groups", id],
    queryFn: () => api.group.getGroup(id),
  });

  function onSuccess() {
    [
      ["groups"],
      ["groups", "latest"],
      ["groups", id],
    ].forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
  }

  const updateTitle = useMutation({
    mutationFn: (title: string) => api.group.updateGroup(id, {
      title,
      artists: group.artists.map(({ id }: HasId) => id),
    }),
    onSuccess
  });

  const deleteArtistsFromGroup = useMutation({
    mutationFn: async (artists: HasId[]) => {
      if (
        !window.confirm(
          `Are you sure to remove ${artists.length} Artists from Group?`
        )
      ) {
        return;
      }
      const ids = artists.map(({ id }) => id);
      return api.group.updateGroup(id, {
        title: group.title,
        artists: group.artists
          .map(({ id }: HasId) => id)
          .filter((id: number) => !ids.includes(id)),
      });
    },
    onSuccess
  });

  return {
    group,
    isPending,
    error,
    updateTitle: updateTitle.mutate,
    deleteArtistsFromGroup: deleteArtistsFromGroup.mutate
  }
}