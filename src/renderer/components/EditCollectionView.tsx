import type { FormEvent } from "react";
import type { Collection } from "@/types/types";
import cx from "clsx";
import styles from "./EditCollectionView.module.css";
import formStyles from "../forms.module.css";
import useCollection from "../query/useCollection";

type EditCollectionViewProps = {
  collection: Collection;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditCollectionView({
  collection,
  onSave,
  onCancel,
}: EditCollectionViewProps) {
  const { updateTitle } = useCollection(collection.id);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    updateTitle(data.get("title") as string);
    onSave();
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
      </div>
    </div>
  );
}
