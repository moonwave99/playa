import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GroupWithArtists } from "@/types/types";
import api from '../api';

type UseGroups = {
  isPending: boolean;
  error: Error;
  groups: GroupWithArtists[];
  deleteGroups: (ids: number[]) => void;
};

const pageSize = 50;

export default function useGroups(): UseGroups {
  const queryClient = useQueryClient();
  const { isPending, error, data: groups } = useQuery({
    queryKey: ["groups", "latest"],
    queryFn: () => api.group.getGroups({ take: pageSize }),
  });

  function onSuccess() {
    [
      ["groups"],
      ["groups", "latest"],
    ].forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
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
    onSuccess
  });

  return {
    groups,
    isPending,
    error,
    deleteGroups: deleteGroups.mutate
  }
}