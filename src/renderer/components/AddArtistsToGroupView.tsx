import { ArtistWithReleases, GroupWithArtists } from "@/types/types";
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

  async function onSubmit(itemTo: GroupWithArtists) {
    if (!itemTo.id) {
      addArtistsToNewGroup({ title: itemTo.title, artists });
    } else {
      addArtistsToGroup({ id: itemTo.id, artists });
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
