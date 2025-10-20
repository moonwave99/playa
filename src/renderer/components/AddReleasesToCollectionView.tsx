import { Collection, ReleaseWithArtist } from "@/types/types";
import AddToEntityListView from "./AddToEntityListView";
import useCollections from "../query/useCollections";

type AddReleasesToCollectionViewProps = {
  releases: ReleaseWithArtist[];
  onSave: () => void;
  onCancel: () => void;
};

export default function AddReleasesToCollectionView({
  releases,
  onSave,
  onCancel,
}: AddReleasesToCollectionViewProps) {
  const { collections, addReleasesToCollection, addReleasesToNewCollection } =
    useCollections();

  async function onSubmit(itemTo: Collection) {
    if (!itemTo.id) {
      addReleasesToNewCollection({ title: itemTo.title, releases });
    } else {
      addReleasesToCollection({ id: itemTo.id, releases });
    }
    onSave();
  }

  return (
    <AddToEntityListView
      from="Release"
      to="Collection"
      itemsFrom={releases}
      itemsTo={collections}
      onSubmit={onSubmit}
      onCancel={onCancel}
      autoFocus
    />
  );
}
