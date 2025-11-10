import { Collection, ReleaseWithArtist } from "@/types/types";
import useCollections from "../query/useCollections";
import AddToEntityListView from "../components/AddToEntityListView";

type AddReleasesToCollectionViewProps = {
  releases: ReleaseWithArtist[];
  closeModal: () => void;
};

export default function AddReleasesToCollectionView({
  releases,
  closeModal,
}: AddReleasesToCollectionViewProps) {
  const { collections, addReleasesToCollection, addReleasesToNewCollection } =
    useCollections();

  async function onSubmit(itemTo: Collection) {
    if (!itemTo.id) {
      addReleasesToNewCollection({ title: itemTo.title, releases });
    } else {
      addReleasesToCollection({ id: itemTo.id, releases });
    }
    closeModal();
  }

  return (
    <AddToEntityListView
      from="Release"
      to="Collection"
      itemsFrom={releases}
      itemsTo={collections}
      onSubmit={onSubmit}
      onCancel={closeModal}
      autoFocus
    />
  );
}
