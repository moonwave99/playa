import { ArtistWithReleases, GroupWithArtists } from "@/types/types";
import AddToEntityListView from "./AddToEntityListView";
import useGroups from "../query/useGroups";

type AddArtistsToGroupViewProps = {
  artists: ArtistWithReleases[];
  closeModal: () => void;
};

export default function AddArtistsToGroupView({
  artists,
  closeModal,
}: AddArtistsToGroupViewProps) {
  const { groups, addArtistsToGroup, addArtistsToNewGroup } = useGroups();

  async function onSubmit(itemTo: GroupWithArtists) {
    if (!itemTo.id) {
      addArtistsToNewGroup({ title: itemTo.title, artists });
    } else {
      addArtistsToGroup({ id: itemTo.id, artists });
    }
    closeModal();
  }

  return (
    <AddToEntityListView
      from="Artist"
      to="Group"
      itemsFrom={artists}
      itemsTo={groups}
      onSubmit={onSubmit}
      onCancel={closeModal}
      autoFocus
    />
  );
}
