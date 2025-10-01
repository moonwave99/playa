import type { FormEvent } from "react";
import useCollection from "../query/useCollection";
import EntityCardList from "./EntityCardList";
import ErrorView from "./ErrorView";
import Loading from "./Loading";
import cx from "clsx";
import styles from "./EditCollectionView.module.css";
import formStyles from "../forms.module.css";

type EditCollectionViewProps = {
  id: number;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditCollectionView({
  id,
  onSave,
  onCancel,
}: EditCollectionViewProps) {
  const {
    collection,
    isPending,
    error,
    updateTitle,
    removeReleasesFromCollection,
  } = useCollection(id);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    updateTitle(data.get("title") as string);
    onSave();
  }

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <div className={styles.view}>
      <div className={formStyles.container}>
        <h2>Edit Collection</h2>
        <form onSubmit={onSubmit} className={formStyles.form}>
          <label className={cx(formStyles.label, styles.label)}>
            Title
            <input
              autoFocus
              className={cx(formStyles.input, styles.input)}
              required
              name="title"
              placeholder="Enter the collection title"
              defaultValue={collection.title}
            />
          </label>

          <div className={formStyles.actions}>
            <button type="submit" className={formStyles.button}>
              Save
            </button>
            <button
              type="button"
              className={formStyles.button}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
        {collection.releases.length ? (
          <section>
            <h3>Releases</h3>
            <EntityCardList
              items={collection.releases}
              onRemoveEntityClick={(release) =>
                removeReleasesFromCollection([release])
              }
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}
