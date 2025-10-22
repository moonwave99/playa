import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { GroupWithArtists, HasId } from "@/types/types";
import api from "../api";

type UseGroup = {
  isPending: boolean;
  error: Error;
  group: GroupWithArtists;
  updateTitle: (title: string) => void;
  addArtistsToGroup: (artists: HasId[]) => void;
  removeArtistsFromGroup: (artists: HasId[]) => void;
};

export default function useGroup(id: number): UseGroup {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    isPending,
    error,
    data: group,
  } = useQuery({
    queryKey: ["groups", id],
    queryFn: () => api.group.getGroup(id) as Promise<GroupWithArtists>,
  });

  function onSuccess() {
    [["groups"], ["groups", "latest"], ["groups", id]].forEach((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    );
  }

  const updateTitle = useMutation({
    mutationFn: (title: string) =>
      api.group.updateGroup(id, {
        title,
        artists: group.artists.map(({ id }: HasId) => id),
      }),
    onSuccess,
  });

  const addArtistsToGroup = useMutation({
    mutationFn: async (artists: HasId[]) =>
      api.group.addArtistsToGroup(id, artists),
    onSuccess,
  });

  const removeArtistsFromGroup = useMutation({
    mutationFn: async (artists: HasId[]) => {
      const confirm = await api.dialog.openConfirmDialog(
        t("confirm.removeArtistsFromGroup.title"),
        t("confirm.removeArtistsFromGroup.message", {
          count: artists.length,
        })
      );
      if (!confirm) {
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
    onSuccess,
  });

  return {
    group,
    isPending,
    error,
    updateTitle: updateTitle.mutate,
    addArtistsToGroup: addArtistsToGroup.mutate,
    removeArtistsFromGroup: removeArtistsFromGroup.mutate,
  };
}
