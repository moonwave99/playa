import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GroupWithArtists, HasId } from "@/types/types";
import api from "../api";

type AddArtistsToGroupParams = {
  id: number;
  artists: HasId[];
};

type AddArtistsToNewGroupParams = {
  title: string;
  artists: HasId[];
};

type UseGroups = {
  isPending: boolean;
  error: Error;
  groups: GroupWithArtists[];
  deleteGroups: (ids: number[]) => void;
  addArtistsToGroup: (params: AddArtistsToGroupParams) => void;
  addArtistsToNewGroup: (params: AddArtistsToNewGroupParams) => void;
};

type UseGroupsParams = {
  pageSize: number;
};

export default function useGroups(
  { pageSize }: UseGroupsParams = { pageSize: 50 }
): UseGroups {
  const queryClient = useQueryClient();
  const {
    isPending,
    error,
    data: groups,
  } = useQuery({
    queryKey: ["groups", "latest"],
    queryFn: () =>
      api.group.getGroups({ take: pageSize }) as Promise<GroupWithArtists[]>,
  });

  function onSuccess() {
    [["groups"], ["groups", "latest"]].forEach((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    );
  }

  const deleteGroups = useMutation({
    mutationFn: (ids: number[]) => {
      if (
        !window.confirm(
          `Are you sure to remove ${ids.length} Groups from Library?`
        )
      ) {
        return;
      }
      return api.group.deleteGroups(ids);
    },
    onSuccess,
  });

  function onAddArtistToGroupSuccess(
    group: GroupWithArtists,
    { artists }: { artists: HasId[] }
  ) {
    [["groups", group.id], ...artists.map((x) => ["artists", x.id])].forEach(
      (queryKey) => queryClient.invalidateQueries({ queryKey })
    );
  }

  const addArtistsToGroup = useMutation({
    mutationFn: ({ id, artists }: AddArtistsToGroupParams) =>
      api.group.addArtistsToGroup(id, artists),
    onSuccess: onAddArtistToGroupSuccess,
  });

  const addArtistsToNewGroup = useMutation({
    mutationFn: ({ title, artists }: AddArtistsToNewGroupParams) =>
      api.group.addArtistsToNewGroup(title, artists),
    onSuccess: onAddArtistToGroupSuccess,
  });

  return {
    groups,
    isPending,
    error,
    deleteGroups: deleteGroups.mutate,
    addArtistsToGroup: addArtistsToGroup.mutate,
    addArtistsToNewGroup: addArtistsToNewGroup.mutate,
  };
}
