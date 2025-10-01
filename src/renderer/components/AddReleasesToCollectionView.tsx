import type { FormEvent } from "react";
import { ReleaseWithArtist } from "@/types/types";
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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const collectionId = data.get("collection");
    const title = data.get("title") as string;

    if (title) {
      addReleasesToNewCollection({ title, releases });
    } else if (collectionId) {
      addReleasesToCollection({ id: +collectionId, releases });
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
    />
  );
}
