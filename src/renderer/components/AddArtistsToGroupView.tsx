import type { FormEvent } from "react";
import { ArtistWithReleases } from "@/types/types";
import AddToEntityListView from "./AddToEntityListView";
import useGroups from "../query/useGroups";

type AddArtistsToGroupViewProps = {
  artists: ArtistWithReleases[];
  onSave: () => void;
  onCancel: () => void;
};

export default function AddArtistsToGroupView({
  artists,
  onSave,
  onCancel,
}: AddArtistsToGroupViewProps) {
  const { groups, addArtistsToGroup, addArtistsToNewGroup } = useGroups();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const groupId = data.get("group");
    const title = data.get("title") as string;

    if (title) {
      addArtistsToNewGroup({ title, artists });
    } else if (groupId) {
      addArtistsToGroup({ id: +groupId, artists });
    }
    onSave();
  }

  return (
    <AddToEntityListView
      from="Artist"
      to="Group"
      itemsFrom={artists}
      itemsTo={groups}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}
